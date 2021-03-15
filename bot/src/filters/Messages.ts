import { WorkerManager } from '../managers/Worker'

import { FilterResponse } from '../structures/Filter'

import { APIMessage, Snowflake } from 'discord-api-types'

import { Cache } from 'discord-rose/dist/utils/Cache'
import { GuildDB } from '../../../typings/typings'

import { ActionType } from '../structures/Responses'

interface MultiLine {
  author: Snowflake,
  messages: {
    [key: string]: APIMessage
  }
}

const multiLineStore: Cache<Snowflake, MultiLine> = new Cache(3.6e+6)

function handleDeletion (worker: WorkerManager, message: APIMessage, db: GuildDB, response: FilterResponse) {
  if (!worker.hasPerms(message.guild_id, 'sendMessages')) return
  if (!worker.hasPerms(message.guild_id, 'embed')) {
    return worker.api.messages.send(message.channel_id, 'Missing `Embed Links` permission.')
  }
  if (!worker.hasPerms(message.guild_id, 'manageMessages')) {
    return worker.responses.missingPermissions(message.channel_id, 'Manage Messages')
  }
  const multi = multiLineStore.get(message.channel_id)

  worker.actions.delete(message.channel_id, multi ? Object.values(multi.messages).map(x => x.id) : [message.id])

  if (multi) multiLineStore.delete(message.channel_id)

  if (db.log) worker.responses.log(message.edited_timestamp ? ActionType.EditedMessage : ActionType.Message, message.content, message, response, db.log)

  if (db.msg.content !== false) worker.actions.popup(message.channel_id, message.author.id, db)

  // response.filters.includes('invites')
  return true
}

export async function MessageHandler (worker: WorkerManager, message: APIMessage) {
  const channel = worker.channels.get(message.channel_id)
  if (!message.guild_id || !channel || !message.member) return

  let multiline = multiLineStore.get(message.channel_id)
  if (multiline && multiline.author !== message.author.id) multiLineStore.delete(message.channel_id)

  if (message.author.bot) return

  const db = await worker.db.config(message.guild_id)

  if (message.edited_timestamp) {
    if (!db.censor.emsg) return
  } else if (!db.censor.msg) return

  if (
    message.type !== 0 ||
    channel.type !== 0 ||
    channel.nsfw       ||
    message.member.roles.includes(db.role) ||
    db.channels.includes(message.channel_id)
  ) return

  let content = message.content

  if (db.multi) {
    if (!multiline) {
      multiline = {
        author: message.author.id,
        messages: {}
      }
    }

    multiline.messages[message.id] = message

    multiLineStore.set(message.channel_id, multiline)

    content = Object.values(multiline.messages).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(x => x.content).join('\n')
  }

  const response = worker.filter.test(content, db.filters, db.filter, db.uncensor, db.fonts)

  if (!response.censor) return

  return handleDeletion(worker, {...message, content}, db, response)
}