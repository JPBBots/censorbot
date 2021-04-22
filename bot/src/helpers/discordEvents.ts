import { Embed, PermissionsUtils } from 'discord-rose'
import { WorkerManager } from '../managers/Worker'

import Collection from '@discordjs/collection'

import { APIGuildMember, APIRole, Snowflake } from 'discord-api-types'

const unavailables = new Set()

export function setupDiscord (worker: WorkerManager): void {
  worker.on('GUILD_CREATE', (guild) => {
    if (unavailables.has(guild.id)) return unavailables.delete(guild.id)

    const roles: Collection<Snowflake, APIRole> = new Collection()
    guild.roles.forEach(x => {
      roles.set(x.id, x)
    })
    const hasPerms = (perm: keyof typeof PermissionsUtils.bits): boolean => {
      return PermissionsUtils.calculate(guild.members?.find(x => x.user?.id === worker.user.id) as APIGuildMember, guild, roles, perm)
    }

    const links = worker.config.links
    if (guild.system_channel_id) {
      if (!hasPerms('sendMessages')) return
      if (!hasPerms('embed')) return void worker.api.messages.send(guild.system_channel_id, 'Missing `Embed Links` permission. This will likely cause issues with the functionality of the bot.')

      const perms = worker.config.requiredPermissions.filter(x => x.vital && !hasPerms(x.permission))
      const embed = new Embed()
        .color(worker.responses.color)
        .title('Thanks for inviting Censor Bot!')
        .field('Enjoy!', `The dashboard: ${links.dashboard}\n[Website](${links.site}) | [Support](${links.support})`)

      if (perms.length > 0) embed.field('Missing a few permissions!', `Some vital permissions are missing:\n${perms.map(x => `\`${x.name}\``).join(', ')}\nType +permissions to see why we need them and recheck them.`)
      else embed.field('Permissions', 'To debug and check your permissions run `+debug`')

      void worker.api.messages.send(guild.system_channel_id, embed)
    }
  })
  worker.on('GUILD_UNAVAILABLE', (guild) => {
    unavailables.add(guild.id)
  })
  worker.on('READY', () => {
    void worker.punishments.timeouts.checkTimeouts()

    if (worker.config.custom.allowedGuilds) {
      worker.guilds.forEach(guild => {
        if (!worker.config.custom.allowedGuilds?.includes(guild.id)) {
          void worker.api.guilds.leave(guild.id)
        }
      })
    }
  })
  worker.on('GUILD_CREATE', (guild) => {
    if (worker.config.custom.allowedGuilds && !worker.config.custom.allowedGuilds.includes(guild.id)) {
      void worker.api.guilds.leave(guild.id)
    }
  })
}
