var _
var guild

_.setRoot([
  _.elm('section', { id: 'general' }, [
    _.elm('h1', 'General'),

    // prefix
    _.elm('div', [
      _.preset.title('Prefix', 'The prefix in which the bot responds to for commands.'),
      _.elm('input', {}, {
        maxlength: 10,
        placeholder: 'None',
        typed: 'none',
        setting: 'prefix'
      })
    ]),

    // log channel
    _.elm('div', [
      _.preset.title('Log Channel', 'Channel to log infractions, as well as punishment outcomes.'),
      _.elm('select', {}, {
        typed: 'list',
        setting: 'log'
      }, [
        _.elm('option', { innerText: 'None', value: 'null' }),
        ...guild.c.map(c => _.elm('option', { value: c.id, innerText: `#${c.name}` }))
      ])
    ]),

    // uncensor role
    _.elm('div', [
      _.preset.title('Uncensor Role', 'Role to ignore completely with the filter.'),
      _.elm('select', {}, {
        typed: 'list',
        setting: 'role'
      }, [
        _.elm('option', { innerText: 'None', value: 'null' }),
        ...guild.r.map(r => _.elm('option', { value: r.id, innerText: `@${r.name}` }))
      ])
    ]),

    // ignore channels
    _.elm('div', [
      _.preset.title('Ignore Channels', 'Ignore specific channels without having to make it NSFW'),
      _.elm('input', {}, {
        placholder: 'Add Channels',
        typed: 'list',
        setting: 'role'
      })
    ])
  ]),
  _.elm('section', { id: 'filter' }, [
    _.elm('h1', 'Filter'),

    // invites
    _.elm('div', [
      _.preset.title('Censor Invites', 'Whether to censor invites'),
      _.elm('input', {
        type: 'checkbox'
      }, {
        typed: 'boolean',
        setting: 'invites'
      })
    ]),

    // Multi-Line
    _.elm('div')
  ])
])
