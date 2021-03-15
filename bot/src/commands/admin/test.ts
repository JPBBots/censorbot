import { CommandOptions } from 'discord-rose/dist/typings/lib'

export default {
  command: 'test',
  description: 'Test filter',
  admin: true,
  exec: (ctx) => {
    const response = ctx.worker.filter.test(ctx.args.join(' '), ctx.db.filters, ctx.db.filter, ctx.db.uncensor, true)
    const embed = ctx.embed
      .title('Censored: ' + response.censor)
      .description(`\`\`\`json\n${JSON.stringify(response, null, 4)}\`\`\``)

    if (response.censor) embed.field('Contains curse', `||${ctx.worker.filter.surround(ctx.args.join(' '), response.ranges, '__')}||`, true)

    embed.send(false)
  }
} as CommandOptions
