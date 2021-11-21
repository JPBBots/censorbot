import { CommandOptions } from 'discord-rose'

export default {
  command: 'test',
  description: 'Test filter',
  admin: true,
  exec: (ctx) => {
    const response = ctx.worker.filter.test(ctx.args.join(' '), ctx.db)
    const embed = ctx.embed
      .title(`Censored: ${response.censor}`)
      .description(`\`\`\`json\n${JSON.stringify(response, null, 4)}\`\`\``)

    if (response.censor)
      embed.field(
        'Contains curse',
        `||${ctx.worker.filter.surround(
          ctx.args.join(' '),
          response.ranges,
          '__'
        )}||`,
        true
      )

    void embed.send(false)
  }
} as CommandOptions
