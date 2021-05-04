import { WorkerManager } from '../managers/Worker'

import { FilterResponse } from '../structures/Filter'

import { Snowflake, GatewayMessageCreateDispatchData, GatewayMessageUpdateDispatchData } from 'discord-api-types'

import { Cache } from 'discord-rose/dist/utils/Cache'
import { CensorMethods, GuildDB, PunishmentType } from 'typings/api'

interface MultiLine {
  author: Snowflake
  messages: {
    [key: string]: EventData
  }
}

const multiLineStore: Cache<Snowflake, MultiLine> = new Cache(3.6e+6)

const replaces = {
  1: '#',
  2: '*'
}

type EventData = GatewayMessageCreateDispatchData | GatewayMessageUpdateDispatchData

function handleDeletion (worker: WorkerManager, message: EventData, db: GuildDB, response: FilterResponse): void {
  if (!message.guild_id || !message.content || !message.author || !message.member) return

  if (!worker.hasPerms(message.guild_id, 'sendMessages', message.channel_id)) return
  if (!worker.hasPerms(message.guild_id, 'embed', message.channel_id)) {
    return void worker.api.messages.send(message.channel_id, 'Missing `Embed Links` permission.')
  }
  if (!worker.hasPerms(message.guild_id, 'manageMessages', message.channel_id)) {
    return void worker.responses.missingPermissions(message.channel_id, 'Manage Messages')
  }
  const multi = multiLineStore.get(message.channel_id)

  void worker.actions.delete(message.channel_id, multi ? Object.values(multi.messages).map(x => x.id) : [message.id])

  if (multi) multiLineStore.delete(message.channel_id)

  if (db.log && worker.channels.has(db.log)) {
    void worker.responses.log(CensorMethods.Messages, message.content, message, response, db.log)
  }

  if (db.msg.content !== false) worker.actions.popup(message.channel_id, message.author.id, db)

  if (response.ranges.length > 0 && db.webhook.enabled) {
    let content = worker.filter.surround(message.content, response.ranges, '||')

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    if (db.webhook.replace !== 0) content = content.split(/\|\|/g).reduce((a, b) => [(a[0] + (a[1] === 1 ? replaces[db.webhook.replace].repeat(b.length) : b)), ((a[1] as number) * -1)], ['', -1])[0]

    void worker.actions.sendAs(message.channel_id, message.author, message.member?.nick ?? message.author.username, content)
  }

  if (db.punishment.type !== PunishmentType.Nothing) {
    switch (db.punishment.type) {
      case PunishmentType.Mute:
        if (!worker.hasPerms(message.guild_id, 'manageRoles')) return void worker.responses.missingPermissions(message.channel_id, 'Manage Roles')
        break
      case PunishmentType.Kick:
        if (!worker.hasPerms(message.guild_id, 'kick')) return void worker.responses.missingPermissions(message.channel_id, 'Kick Members')
        break
      case PunishmentType.Ban:
        if (!worker.hasPerms(message.guild_id, 'ban')) return void worker.responses.missingPermissions(message.channel_id, 'Ban Members')
        break
    }

    void worker.punishments.punish(message.guild_id, message.author.id)
  }
}

export async function MessageHandler (worker: WorkerManager, message: EventData): Promise<void> {
  const channel = worker.channels.get(message.channel_id)
  if (!message.guild_id || !message.content || !message.author || !channel || !message.member) return

  let multiline = multiLineStore.get(message.channel_id)
  if (multiline && multiline.author !== message.author.id) multiLineStore.delete(message.channel_id)

  if (message.author.bot) return

  const db = await worker.db.config(message.guild_id)

  if ((db.censor & CensorMethods.Messages) === 0) return

  if (
    message.type !== 0 ||
    channel.type !== 0 ||
    message.member.roles.some(role => db.role?.includes(role)) ||
    db.channels.includes(message.channel_id)
  ) return

  let content = message.content

  if (db.invites) {
    if (content.match(/discord((app)?\.com\/invite|\.gg)\/([-\w]{2,32})/i)) {
      return handleDeletion(worker, message, db, {
        censor: true,
        filters: ['invites'],
        places: [],
        ranges: []
      })
    }
  }

  if (db.nsfw && channel.nsfw) return

  if (db.toxicity) {
    const prediction = await worker.perspective.test(content)
    if (prediction.bad) {
      return handleDeletion(worker, message, db, {
        censor: true,
        filters: ['toxicity'],
        places: [],
        ranges: [],
        percentage: prediction.percent
      })
    }
  }

  if (db.multi) {
    if (!multiline) {
      multiline = {
        author: message.author.id,
        messages: {}
      }
    }

    multiline.messages[message.id] = message

    multiLineStore.set(message.channel_id, multiline)

    content = Object.values(multiline.messages).sort((a, b) => new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()).map(x => x.content).join('\n')
  }

  const response = worker.filter.test(content, db)

  if (!response.censor) return

  return handleDeletion(worker, { ...message, content }, db, response)
}
