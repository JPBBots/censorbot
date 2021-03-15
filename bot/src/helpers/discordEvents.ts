import { Embed } from 'discord-rose'
import { WorkerManager } from '../managers/Worker'

import Collection from '@discordjs/collection'

import { bits, PermissionsUtils } from 'discord-rose/dist/utils/Permissions'
import { APIRole, Snowflake } from 'discord-api-types'

const unavailables = new Set()

export function setupDiscord (worker: WorkerManager) {
  worker.on('GUILD_CREATE', (guild) => {
    if (unavailables.has(guild.id)) return unavailables.delete(guild.id)
    
    const roles: Collection<Snowflake, APIRole> = new Collection()
    guild.roles.forEach(x => {
      roles.set(x.id, x)
    })
    const hasPerms = (perm: keyof typeof bits) => {
      return PermissionsUtils.calculate(guild.members.find(x => x.user.id === worker.user.id), guild, roles, perm)
    }

    const links = worker.config.links
    if (guild.system_channel_id) {
      if (!hasPerms('sendMessages')) return
      if (!hasPerms('embed')) return worker.api.messages.send(guild.system_channel_id, 'Missing `Embed Links` permission. This will likely cause issues with the functionality of the bot.')

      const perms = (['manageMessages', 'manageNicknames', 'manageRoles', 'kick', 'ban', 'webhooks']).filter(x => !hasPerms(x as keyof typeof bits))
      const embed = new Embed()
        .color(worker.responses.color)
        .title('Thanks for inviting Censor Bot!')
        .field('Enjoy!', `The dashboard: ${links.dashboard}\n[Website](${links.site}) | [Support](${links.support})`)

      if (perms.length > 0) embed.field('Missing a few permissions!', `Some vital permissions are missing:\n${perms.map(x => `\`${x}\``).join(', ')}`)
      worker.api.messages.send(guild.system_channel_id, embed)
    }
  })
  worker.on('GUILD_UNAVAILABLE', (guild) => {
    unavailables.add(guild.id)
  })
}