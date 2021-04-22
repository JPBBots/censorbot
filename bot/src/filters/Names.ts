import { WorkerManager } from '../managers/Worker'

import { FilterResponse } from '../structures/Filter'

import { GatewayGuildMemberUpdateDispatchData } from 'discord-api-types'

import { CensorMethods, GuildDB } from 'typings/api'

function handleCensor (worker: WorkerManager, member: GatewayGuildMemberUpdateDispatchData, db: GuildDB, response: FilterResponse): void {
  if (db.log && worker.channels.has(db.log)) {
    void worker.responses.log(CensorMethods.Names, member.nick ?? member.user.username, member, response, db.log)
  }
  void worker.api.members.setNickname(member.guild_id, member.user.id, member.nick ? null : 'Innapropriate name')
}

export async function NameHandler (worker: WorkerManager, member: GatewayGuildMemberUpdateDispatchData): Promise<void> {
  if (
    !member ||
    member.user.bot
  ) return

  console.debug(member)

  const db = await worker.db.config(member.guild_id)

  if (
    (db.censor & CensorMethods.Names) === 0 ||
    member.roles.some(role => db.role?.includes(role))
  ) return

  if (member.nick === 'Innapropriate name') return

  const res = worker.filter.test(member.nick ?? member.user.username, db.filters, db.filter, db.uncensor)
  console.debug(res)

  if (!res.censor) return

  handleCensor(worker, member, db, res)
}
