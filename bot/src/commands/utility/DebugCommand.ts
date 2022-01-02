import { Command, Guild, Run, Worker, Me } from '@jadl/cmd'
import { Embed } from '@jadl/embed'
import { APIGuild, APIGuildMember } from 'discord-api-types'
import { PermissionUtils } from 'jadl'
import { WorkerManager } from '../../managers/Worker'

@Command('debug', 'Debug permissions and more')
export class DebugCommand {
  @Run()
  run(
    @Guild(true) guild: APIGuild,
    @Worker() worker: WorkerManager,
    @Me() me: APIGuildMember
  ) {
    const embed = new Embed()
      .title('Debug')
      .color(worker.responses.color)
      .timestamp()

    const permissions = PermissionUtils.combine({
      guild,
      member: me,
      roleList: worker.guildRoles.get(guild.id)
    })

    embed.field(
      'Permissions',
      `${worker.config.requiredPermissions
        .map(
          (perm) =>
            `${
              PermissionUtils.has(permissions, perm.permission)
                ? ':white_check_mark:'
                : ':x:'
            }  ${perm.vital ? ':exclamation:' : ''} __${perm.name}__: ${
              perm.why
            }`
        )
        .join('\n')} \n\n:exclamation: means the permission is vital`
    )

    return embed
  }
}
