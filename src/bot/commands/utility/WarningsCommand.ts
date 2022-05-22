import {
  Command,
  Guild,
  Worker,
  SubCommand,
  Options,
  Permissions
} from '@jadl/cmd'
import { Embed } from '@jadl/embed'
import { APIGuild, APIGuildMember } from 'discord-api-types/v9'
import { GuildDB } from '@censorbot/typings'
import { WorkerManager } from '../../managers/Worker'
import { Db } from '../decorators/Db'

@Command('warnings', "Manage users' warning count")
@Permissions('manageMessages')
export class WarningsCommand {
  @SubCommand('clear', "Clear a user's warnings")
  async clear(
    @Worker() worker: WorkerManager,
    @Guild(true) guild: APIGuild,
    @Options.Member('user', 'User to clear warnings for', { required: true })
    member: APIGuildMember & { user }
  ) {
    await worker.punishments.db.deleteOne({
      user: member.user.id,
      guild: guild.id
    })

    return new Embed()
      .color(worker.responses.color)
      .title(`Warnings cleared for ${member.nick ?? member.user.username}`)
  }

  @SubCommand('set', "Set a user's warnings")
  async set(
    @Worker() worker: WorkerManager,
    @Guild(true) guild: APIGuild,
    @Options.Member('user', 'User to set warnings for', { required: true })
    member: APIGuildMember & { user },
    @Options.Number('warnings', 'Number of warnings', { required: true })
    warnings: number
  ) {
    await worker.punishments.db.updateOne(
      {
        user: member.user.id,
        guild: guild.id
      },
      {
        $set: {
          user: member.user.id,
          guild: guild.id,
          warnings: new Array(warnings).fill(Date.now())
        }
      },
      {
        upsert: true
      }
    )

    return new Embed()
      .color(worker.responses.color)
      .title(
        `${member.nick ?? member.user.username} now has ${warnings} warnings`
      )
  }

  static makeInfoString(
    warning: number,
    index: number,
    expires: number | null
  ) {
    if (expires && Date.now() > warning + expires) return null

    let str = `${index}. `

    if (warning === Infinity) {
      str += 'Forever'
      return str
    }

    str += `Received <t:${(warning / 1000).toFixed(0)}:R>`

    if (expires)
      str += ` Expires <t:${((warning + expires) / 1000).toFixed(0)}:R>`

    return str
  }

  @SubCommand('view', "View a user's warnings")
  async view(
    @Worker() worker: WorkerManager,
    @Guild(true) guild: APIGuild,
    @Db() db: GuildDB,
    @Options.Member('user', 'User to view warnings for', { required: true })
    member: APIGuildMember & { user }
  ) {
    const punishUser = await worker.punishments.db.findOne({
      user: member.user.id,
      guild: guild.id
    })

    const warnings = punishUser?.warnings
      .map((warning, ind) =>
        WarningsCommand.makeInfoString(warning, ind + 1, db.punishments.expires)
      )
      .filter((x) => x)

    const embed = new Embed()
      .color(worker.responses.color)
      .title(
        `${member.nick ?? member.user.username} has ${
          warnings?.length ?? 0
        } warnings`
      )

    if (warnings?.length) embed.description(warnings?.join('\n') ?? 'None')

    return embed
  }
}
