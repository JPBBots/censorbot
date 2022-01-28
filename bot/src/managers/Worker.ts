import { PermissionUtils, Worker } from 'jadl'

import { Embed } from '@jadl/embed'

import { Config } from '../config'

import { Database } from '../structures/Database'
import { Filter } from '../structures/Filter'
import { ActionBucket } from '../structures/ActionBucket'
import { Responses } from '../structures/Responses'

import { TicketManager } from '../structures/TicketManager'

import { Toxicity } from '../structures/extensions/Toxicity'
import { AntiNSFW } from '../structures/extensions/AntiNSFW'
import { Ocr } from '../structures/extensions/Ocr'

import { PunishmentManager } from '../structures/punishments/PunishmentManager'

import { APIChannel, Snowflake } from 'discord-api-types'
import { Collection } from '@discordjs/collection'

import { ClusterEvents } from '../helpers/ClusterEvents'

import { MessagesFilterHandler } from '../filters/Messages'
import { NamesFilterHandler } from '../filters/Names'
import { ReactionsFilterHandler } from '../filters/Reactions'

import { Interface } from '@jpbbots/interface'

import { Cache } from '@jpbberry/cache'

import util from 'util'
import fetch from 'node-fetch'

import { ExceptionType, GuildDB } from 'typings'
import { WorkerEvents } from '../helpers/WorkerEvents'
import { AntiPhish } from '../structures/extensions/AntiPhish'
import { Requests } from '../helpers/Requests'
import { CommandHandler, formatMessage } from '@jadl/cmd'

import { DashboardCommand } from '../commands/info/DashboardCommand'
import { HelpCommand } from '../commands/info/HelpCommand'
import { SnipeCommand } from '../commands/utility/SnipeCommand'
import { DebugCommand } from '../commands/utility/DebugCommand'
import { TicketCommand } from '../commands/TicketCommand'
import { EvalCommand } from '../commands/admin/EvalCommand'
import { ScanCommand } from '../commands/utility/ScanCommand'
import { CustomBotOptions } from 'typings/custombot'

interface CachedThread {
  id: Snowflake
  parentId: Snowflake
  guildId: Snowflake
}

export interface ExceptedData {
  roles?: Snowflake[]
  channel?: Snowflake
}

export class WorkerManager extends Worker<{}> {
  config = Config
  filter = new Filter()
  db = new Database(this.comms)

  actions = new ActionBucket(this)
  responses = new Responses(this)
  tickets = new TicketManager(this)

  requests = new Requests(this.api)

  toxicity = new Toxicity(this)
  images = new AntiNSFW(this)
  ocr = new Ocr(this)
  phishing = new AntiPhish(this)

  punishments = new PunishmentManager(this)

  threads: Collection<Snowflake, CachedThread> = new Collection()

  interface = new Interface()

  snipes: Cache<Snowflake, string> = new Cache(15 * 60 * 1000)

  cmd = new CommandHandler(
    this,
    [
      DashboardCommand,
      HelpCommand,
      SnipeCommand,
      DebugCommand,
      TicketCommand,
      EvalCommand,
      ScanCommand
    ],
    {
      interactionGuild: this.config.staging ? '569907007465848842' : undefined
    }
  )

  public eventHandler = new WorkerEvents(this)
  public clusterEventHandler = new ClusterEvents(this)

  public messagesFilterHandler = new MessagesFilterHandler(this)
  public namesFilterHandler = new NamesFilterHandler(this)
  public reactionsFilterHandler = new ReactionsFilterHandler(this)

  constructor() {
    super()

    this.interface.setupWorker(this)

    this.setStatus(
      this.config.custom.status?.[0] ?? 'watching',
      this.config.custom.status?.[1] ?? 'For Bad Words'
    )

    console.log = (...msg: string[]) => this.comms.log(msg.join(' '))

    this.db.on('started', () => {
      void this.updateCustomBots()
    })
  }

  public async isAdmin(id: Snowflake): Promise<boolean> {
    return await fetch(`https://jpbbots.org/api/admin/${id}`)
      .then(async (x) => await x.text())
      .then((x) => !!Number(x))
  }

  customBots: CustomBotOptions[] = []

  async updateCustomBots() {
    this.customBots = await this.db.collection('custombots').find({}).toArray()
  }

  isCustom(guildId?: Snowflake): boolean {
    if (!guildId) return false

    return this.customBots.some((x) => x.guilds.includes(guildId))
  }

  getThreadParent(
    guildId: Snowflake,
    threadId: Snowflake
  ): APIChannel | undefined {
    const thread = this.threads.get(`${guildId}-${threadId}`)
    if (!thread) return undefined

    return this.channels.get(thread.parentId)
  }

  hasPerms(
    guildId: Snowflake,
    perms:
      | keyof typeof PermissionUtils.bits
      | Array<keyof typeof PermissionUtils.bits>,
    channel?: Snowflake
  ): boolean {
    const guild = this.guilds.get(guildId)
    const member = this.selfMember.get(guildId)
    const roleList = this.guildRoles.get(guildId)
    let overwrites
    if (channel) {
      const c =
        this.channels.get(channel) ?? this.getThreadParent(guildId, channel)
      if (!c) return false
      overwrites = c.permission_overwrites
    }

    if (!guild || !member || !roleList) return false

    const p = Array.isArray(perms) ? perms : [perms]

    const current = PermissionUtils.combine({
      guild,
      member,
      roleList,
      overwrites
    })

    return p.every((x) => PermissionUtils.has(current, x))
  }

  isManageable(
    guildId: Snowflake,
    user: Snowflake,
    userRoleIds: Snowflake[],
    ownerMatters = true
  ): boolean {
    const guild = this.guilds.get(guildId)
    if (!guild) return false

    if (ownerMatters && guild.owner_id === user) return false

    const roles = this.guildRoles.get(guildId)
    if (!roles) return false

    const highestRole = roles
      .filter((x) => userRoleIds.includes(x.id))
      .sort((a, b) => b.position - a.position)
      .first()
    if (!highestRole) return true

    const self = this.selfMember.get(guildId)
    if (!self) return false

    const myHighestRole = roles
      .filter((x) => self.roles.includes(x.id))
      .sort((a, b) => b.position - a.position)
      .first()
    if (!myHighestRole) return false

    return myHighestRole.position > highestRole.position
  }

  webhook(wh: keyof typeof Config.webhooks): Embed {
    const webhook = this.config.webhooks[wh]
    return new Embed(async (embed) => {
      return await this.comms.sendCommand('SEND_WEBHOOK', {
        id: webhook.id,
        token: webhook.token,
        data: formatMessage(embed).data as any
      })
    })
  }

  isExcepted(
    type: ExceptionType,
    { exceptions }: Pick<GuildDB, 'exceptions'>,
    data: ExceptedData
  ): boolean {
    return exceptions.some((x) => {
      if (x.type === ExceptionType.Everything || x.type === type) {
        if (x.role && data.roles) {
          if (!data.roles?.includes(x.role)) return false
        }

        if (x.channel && data.channel) {
          if (data.channel !== x.channel) return false
        }

        return x.channel ? !!data.channel : true && x.role ? !!data.roles : true
      }

      return false
    })
  }

  // isIgnored (channel: APIChannel, db: GuildDB): boolean {
  //   if (db.channels.includes(channel.id)) return true
  //   if (channel.parent_id && db.categories.includes(channel.parent_id)) return true

  //   return false
  // }

  logError(error: Error): void {
    const embed = this.webhook('errors').description(
      `\`\`\`xl\n${util.inspect(error)}\`\`\``
    )

    void embed.send()
  }
}
