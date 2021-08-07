import { WorkerManager } from '../managers/Worker'

import { FilterResponse } from '../structures/Filter'

import { Snowflake, GatewayMessageCreateDispatchData, GatewayMessageUpdateDispatchData, MessageType } from 'discord-api-types'

import { Cache } from '@jpbberry/cache'

import { CensorMethods, GuildDB } from 'typings/api'

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
  if (!message.guild_id || !message.author || !message.member) return

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

  void worker.responses.log(CensorMethods.Messages, message.content ?? 'No Content', message, response, db)

  if (db.msg.content !== false) worker.actions.popup(message.channel_id, message.author.id, db)

  if (response.ranges.length > 0 && db.webhook.enabled && message.content && !db.webhook.ignored.some(x => message.member?.roles.includes(x))) {
    if (!worker.hasPerms(message.guild_id, 'webhooks')) {
      void worker.responses.missingPermissions(message.channel_id, 'Manage Webhooks')
    } else {
      let content = worker.filter.surround(message.content, response.ranges, '||')

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      if (db.webhook.replace !== 0) content = content.split(/\|\|/g).reduce((a, b) => [(a[0] + (a[1] === 1 ? replaces[db.webhook.replace].repeat(b.length) : b)), ((a[1] as number) * -1)], ['', -1])[0]

      void worker.actions.sendAs(message.channel_id, message.author, message.member?.nick ?? message.author.username, content)
    }
  }

  if (!db.punishment.ignored.some(x => message.member?.roles.includes(x))) {
    const perms = worker.punishments.checkPerms(message.guild_id, db)
    if (typeof perms === 'string') return void worker.responses.missingPermissions(message.channel_id, perms)
    if (!perms) void worker.punishments.punish(message.guild_id, message.author.id, message.member.roles)
  }
}

export async function MessageHandler (worker: WorkerManager, message: EventData): Promise<void> {
  const channel = worker.channels.get(message.channel_id) ?? (message.guild_id ? worker.getThreadParent(message.guild_id, message.channel_id) : undefined)
  if (!message.guild_id || !message.author || !channel || !message.member) return

  let multiline = multiLineStore.get(message.channel_id)
  if (multiline && multiline.author !== message.author.id) {
    multiline = undefined
    multiLineStore.delete(message.channel_id)
  }

  if (message.author.bot) return

  const db = await worker.db.config(message.guild_id)

  if (message.content?.startsWith(`${db.prefix}ticket`)) return void worker.api.messages.delete(message.channel_id, message.id)

  if ((db.censor & CensorMethods.Messages) === 0) return

  if (
    ![MessageType.Default, MessageType.Reply].includes(message.type as MessageType) ||
    channel.type !== 0 ||
    message.member.roles.some(role => db.role?.includes(role)) ||
    db.channels.includes(message.channel_id)
  ) return

  let content = message.content as string

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

  const urls: string[] = []
  if (message.attachments) urls.push(...message.attachments.map(x => x.proxy_url))
  if (message.embeds) urls.push(...message.embeds.map(x => x.thumbnail?.proxy_url).filter(x => x) as string[])

  if (db.images) {
    for (const url of urls) {
      const res = await worker.images.test(url)
      if (res.bad) {
        return handleDeletion(worker, { ...message, content: `${message.content ?? 'No message content'} + [image](${url})` }, db, {
          censor: true,
          filters: ['images'],
          places: [],
          ranges: [],
          percentage: res.percent
        })
      }
      continue
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

  if (db.ocr) {
    for (const url of urls) {
      const scanned = await worker.ocr.resolve(url)
      if (scanned) {
        content += `\n${scanned}`
        content = content.replace(url, '')
        const possible = message.embeds?.find(x => x.thumbnail?.proxy_url === url)

        if (possible?.thumbnail?.url) {
          content = content.replace(possible.thumbnail.url, '')
        }
      }
    }
  }

  const response = worker.filter.test(content, db)

  if (!response.censor) return

  return handleDeletion(worker, { ...message, content }, db, response)
}
