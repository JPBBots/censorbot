import { Command, Guild, Run, Worker, Me, Thinks } from '@jadl/cmd'
import { Embed } from '@jadl/embed'
import { APIGuild, APIGuildMember } from 'discord-api-types/v9'
import { PermissionUtils } from 'jadl'
import { WorkerManager } from '../../managers/Worker'

const CHECK = ':white_check_mark:'
const EX = ':x:'

@Command('debug', 'Debug permissions and more')
export class DebugCommand {
  @Run()
  @Thinks()
  async run(
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

    const jpbbots = await worker.interface.api
      ._request('GET', '/')
      .then((x) => (JSON.parse(x)?.healthcheck as boolean) ?? false)
      .catch(() => false)

    const api =
      (await worker.comms
        .masterEval('master.api.eval("`a`")')
        .catch(() => false)) === 'a'

    embed
      .field(
        'Permissions',
        `${worker.config.requiredPermissions
          .map(
            (perm) =>
              `${
                PermissionUtils.has(permissions, perm.permission) ? CHECK : EX
              }  ${perm.vital ? ':exclamation:' : ''} __${perm.name}__: ${
                perm.why
              }`
          )
          .join('\n')} \n\n:exclamation: means the permission is vital`
      )
      .field(
        'APIs',
        [
          `${worker.ocr.working ? CHECK : EX} OCR`,
          `${worker.images.working ? CHECK : EX} NSFW`,
          `${worker.phishing.working ? CHECK : EX} Phishing`,
          `${worker.toxicity.working ? CHECK : EX} Toxicity`
        ].join('\n'),
        true
      )
      .field(
        'Internals',
        [
          `${worker.db.db ? CHECK : EX} Database`,
          `${api ? CHECK : EX} Censor Bot API`,
          `${jpbbots ? CHECK : EX} JPBBots API`
        ].join('\n'),
        true
      )

    return embed
  }
}
