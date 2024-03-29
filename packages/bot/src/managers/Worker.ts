import { PermissionUtils, Worker } from 'jadl'

import { Embed, EmbedWithSendback, parseMessage } from '@jadl/builders'

import Config from '@censorbot/config'

import { Database } from '@censorbot/database'
import { Filter } from '@censorbot/filter'
import { ActionBucket } from '../structures/ActionBucket'
import { Responses } from '../structures/Responses'

import { TicketManager } from '../structures/TicketManager'

import { Toxicity } from '../structures/extensions/Toxicity'
import { AntiNSFW } from '../structures/extensions/AntiNSFW'
import { Ocr } from '../structures/extensions/Ocr'

import { PunishmentManager } from '../structures/punishments/PunishmentManager'

import { APIChannel, ChannelType, Snowflake } from 'discord-api-types/v9'
import { Collection } from '@discordjs/collection'

import { ClusterEvents } from '../helpers/ClusterEvents'

import { MessagesFilterHandler } from '../filters/Messages'
import { NamesFilterHandler } from '../filters/Names'
import { ReactionsFilterHandler } from '../filters/Reactions'
import { ThreadsFilterHandler } from '../filters/Threads'
import { AvatarsFilterHandler } from '../filters/Avatars'

import { Interface } from '@jpbbots/interface'

import { Cache } from '@jpbberry/cache'

import util from 'util'
import fetch from 'node-fetch'

import { ExceptionType, GuildDB, CustomBotOptions } from '@censorbot/typings'
import { WorkerEvents } from '../helpers/WorkerEvents'
import { AntiPhish } from '../structures/extensions/AntiPhish'
import { Requests } from '@censorbot/utils'
import { CommandHandler } from '@jadl/cmd'

import { DashboardCommand } from '../commands/info/DashboardCommand'
import { HelpCommand } from '../commands/info/HelpCommand'
import { SnipeCommand } from '../commands/utility/SnipeCommand'
import { DebugCommand } from '../commands/utility/DebugCommand'
import { TicketCommand } from '../commands/TicketCommand'
import { EvalCommand } from '../commands/admin/EvalCommand'
import { ScanCommand } from '../commands/utility/ScanCommand'
import { WarningsCommand } from '../commands/utility/WarningsCommand'
import { PurgeResendsCommand } from '../commands/utility/PurgeResendsCommand'
import {
  AdminHelpMeCommand,
  HelpMeCommand
} from '../commands/info/HelpMeCommand'
import {
  APIInteractionResponseCallbackData,
  APIMessage
} from 'discord-api-types/v10'

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
  db = new Database(this.comms, this.filter)

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
      // EvalCommand,
      ScanCommand,
      WarningsCommand,
      PurgeResendsCommand,
      HelpMeCommand,
      AdminHelpMeCommand
    ],
    {
      // interactionGuild: this.config.staging ? '569907007465848842' : undefined
    }
  )

  public eventHandler = new WorkerEvents(this)
  public clusterEventHandler = new ClusterEvents(this)

  public messagesFilterHandler = new MessagesFilterHandler(this)
  public namesFilterHandler = new NamesFilterHandler(this)
  public reactionsFilterHandler = new ReactionsFilterHandler(this)
  public threadsFilterHandler = new ThreadsFilterHandler(this)
  public avatarsFilterHandler = new AvatarsFilterHandler(this)

  constructor(custom = false) {
    super()

    if (!custom) {
      this.interface.setupWorker(this)

      this.setStatus(
        this.config.custom.status?.[0] ?? 'watching',
        this.config.custom.status?.[1] ?? 'For Bad Words'
      )
    }

    console.log = (...msg: string[]) => this.comms.log(msg.join(' '))

    this.db.on('started', () => {
      void this.updateCustomBots()

      void this.updateFilters()
    })

    this.interface.commands.setupOldCommand(['+'], this.eventHandler.commands)
  }

  public async updateFilters() {
    const entries = await this.db.collection('filter_data').find({}).toArray()

    this.filter.import(entries)
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
      if ('permission_overwrites' in c) {
        overwrites = c.permission_overwrites
      }
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
    ownerMatters = true,
    adminMatters = false
  ): boolean {
    const guild = this.guilds.get(guildId)
    if (!guild) return false

    if (ownerMatters && guild.owner_id === user) return false

    const roles = this.guildRoles.get(guildId)
    if (!roles) return false

    if (adminMatters) {
      if (
        PermissionUtils.has(
          PermissionUtils.combine({
            member: { roles: userRoleIds, user: { id: user } } as any,
            guild,
            roleList: roles
          }),
          'administrator'
        )
      )
        return false
    }

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

  webhook(wh: keyof typeof Config.webhooks) {
    const webhook = this.config.webhooks[wh]
    return new EmbedWithSendback<Promise<APIMessage>>(async (embed) => {
      return await this.comms
        .sendCommand('SEND_WEBHOOK', {
          id: webhook.id,
          token: webhook.token,
          data: parseMessage(embed) as APIInteractionResponseCallbackData
        })
        .catch(() => null as any)
    })
  }

  isExcepted(
    type: ExceptionType,
    { nsfw, advanced, channels, roles }: GuildDB['exceptions'],
    data: ExceptedData
  ): boolean {
    if (data.channel && channels.includes(data.channel)) return true
    if (data.roles && roles.some((x) => data.roles?.includes(x))) return true

    const channel = data.channel ? this.channels.get(data.channel) : undefined

    if (nsfw && channel && 'nsfw' in channel && channel.nsfw) return true

    return advanced.some((x) => {
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
