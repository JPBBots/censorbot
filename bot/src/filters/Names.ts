import { WorkerManager } from '../managers/Worker'

import { FilterResponse } from '../structures/Filter'

import { GatewayGuildMemberUpdateDispatchData, GatewayGuildMemberAddDispatchData } from 'discord-api-types'

import { CensorMethods, GuildDB } from 'typings/api'

const inappName = 'Inappropriate Name'
const deHoist = String.fromCharCode(856)

type EventData = GatewayGuildMemberUpdateDispatchData | GatewayGuildMemberAddDispatchData

const isHoisting = (name: string): boolean => {
  const char = name.charCodeAt(0)
  if (char < 65) return true
  if (char > 90 && char < 97) return true

  return false
}

function handleCensor (worker: WorkerManager, member: EventData, db: GuildDB, response: FilterResponse): void {
  if (!member.user) return

  const guild = worker.guilds.get(member.guild_id)
  if (!guild) return

  if (!worker.hasPerms(member.guild_id, 'manageNicknames') || !worker.isManageable(member.guild_id, member.user.id, member.roles, true)) {
    if (db.log) void worker.responses.errorLog(db, 'Missing permissions to Manage Nicknames')

    return
  }

  void worker.responses.log(CensorMethods.Names, member.nick ?? member.user.username, member, response, db)

  void worker.api.members.setNickname(member.guild_id, member.user.id, member.nick ? null : inappName).catch(() => {})

  if (!worker.punishments.checkPerms(member.guild_id, db)) {
    void worker.punishments.punish(member.guild_id, member.user.id, member.roles)
  }
}

export async function NameHandler (worker: WorkerManager, member: EventData): Promise<void> {
  if (
    !member ||
    !member.user ||
    member.user.bot
  ) return

  const db = await worker.db.config(member.guild_id)

  const name = member.nick ?? member.user.username

  if (db.antiHoist && isHoisting(name) && worker.hasPerms(member.guild_id, 'manageNicknames') && worker.isManageable(member.guild_id, member.user.id, member.roles, true)) {
    await worker.api.members.setNickname(member.guild_id, member.user.id, `${deHoist}${name}`).catch(() => {})
  }

  if (
    (db.censor & CensorMethods.Names) === 0 ||
    member.roles.some(role => db.role?.includes(role))
  ) return

  if (member.nick === inappName) return

  const res = worker.filter.test(name, db)

  if (!res.censor) return

  handleCensor(worker, member, db, res)
}
