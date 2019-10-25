const emojis = require('emoji-unicode-map')
async function sendSettings (client, message, obj, success) {
  /*
        obj = {
            data: {
                setting: "",
                then: "",
                now: ""
            },
            graves: {
                then: true,
                now: true
            },
            reply: {
                message: "etc"
            }
        }
    */
  var dat = {
    data: {
      setting: obj.data.setting || '',
      then: obj.data.then || '',
      now: obj.data.now || ''
    },
    graves: {
      then: obj.graves.then ? '`' : '',
      now: obj.graves.now ? '`' : ''
    },
    reply: {
      message: obj.reply.message || null
    }
  }

  var logID = await client.rdb.get(message.guild.id, 'log')
  if (!logID) return client.sendErr(message, 'Please set log channel first! +setlog')
  var log = message.guild.channels.get(logID)
  if (!log) return client.sendErr(message, 'Log channel that was set can no longer be found.')
  const EMBED = client.u.embed
    .setTitle('Setting Was Changed!')
    .setTimestamp(new Date())
    .setThumbnail('https://cdn1.iconfinder.com/data/icons/flat-web-browser/100/settings-512.png')
    .setDescription(`In ${message.channel} by ${message.author} (${message.author.tag})`)
    .addField('Setting Changed', dat.data.setting, true)
    .addField('Old Value => New Value', `${dat.graves.then}${dat.data.then}${dat.graves.then} => ${dat.graves.now}${dat.data.now}${dat.graves.now}`, true)
    .setColor('#7089b2')
  log.send(EMBED).catch(() => {})

  if (dat.reply.message) client.sendSuccess(message, dat.reply.message, `${message.author.tag} changed settings.`)
  success(EMBED)
}

const settings = {
  log: {
    desc: {
      name: 'Log Channel',
      main: 'The log channel where deleted messages and punishment logs are sent',
      current: async (client, db, guild) => {
        var cur = await db.get('log')
        var chan = guild.channels.get(cur)
        return `#${chan ? chan.name : 'invalid-channel'}`
      },
      set: {
        desc: "Set's the log channel to the mentioned channel",
        takes: ' #[channel]'
      }
    },
    able: {
      set: /^<#[0-9]+>$/g
    },
    set: async (message, arg, db, client) => {
      var cur = await db.get('log')
      cur = message.guild.channels.get(cur)
      var channel = message.mentions.channels.first()
      if (cur.id === channel.id) return client.sendErr(message, 'Cannot set log channel to the same channel')
      if (!channel) return client.sendErr(message, 'Invalid channel')
      sendSettings(client, message, {
        data: {
          setting: settings.log.desc.name,
          then: `${cur || 'NONE'}`,
          now: `${channel}`
        },
        graves: {
          then: !cur,
          now: false
        },
        reply: {
          message: `Set log channel to ${channel}`
        }
      }, (embed) => {
        db.set('log', channel.id)
        channel.send(embed)
      })
    }
  },
  agp: {
    desc: {
      name: 'Anti-GhostPing',
      main: 'Anti-GhostPing, alerts if a message that pinged someone is deleted by the bot',
      current: async (client, db) => {
        var cur = await db.get('antighostping')
        return `${cur ? 'ON' : 'OFF'}`
      },
      on: {
        desc: "Set's Anti-GhostPing on",
        takes: ''
      },
      off: {
        desc: "Set's Anti-GhostPing off",
        takes: ''
      },
      toggle: {
        desc: 'Toggles the currently set value',
        takes: ''
      }
    },
    able: {
      on: null,
      off: null,
      toggle: null
    },
    on: async (message, arg, db, client) => {
      var cur = await db.get('antighostping')
      sendSettings(client, message, {
        data: {
          setting: settings.agp.desc.name,
          then: cur ? 'ON' : 'OFF',
          now: 'ON'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Turned _ ON'
        }
      }, (embed) => {
        db.set('antighostping', true)
      })
    },
    off: async (message, arg, db, client) => {
      var cur = await db.get('antighostping')
      sendSettings(client, message, {
        data: {
          setting: settings.agp.desc.name,
          then: cur ? 'ON' : 'OFF',
          now: 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Turned Anti-GhostPing OFF'
        }
      }, (embed) => {
        db.set('antighostping', false)
      })
    },
    toggle: async (message, arg, db, client) => {
      var current = await db.get('antighostping')
      var now = !current
      sendSettings(client, message, {
        data: {
          setting: settings.agp.desc.name,
          then: current ? 'ON' : 'OFF',
          now: now ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled Anti-GhostPing ${now ? 'ON' : 'OFF'}`
        }
      }, (embed) => {
        db.set('antighostping', now)
      })
    }
  },
  msg: {
    desc: {
      name: 'Pop Message',
      main: "The content of the message that comes up when someone's curse is deleted",
      current: async (client, db) => {
        var cur = await db.get('msg')
        if (cur === false) {
          cur = 'Disabled'
        }
        if (cur === null) {
          cur = 'Default'
        }
        return `${cur}`
      },
      set: {
        desc: "Set's the pop message's content",
        takes: ' [Anything]'
      },
      reset: {
        desc: "Set's the message back to default",
        takes: ''
      },
      disable: {
        desc: "Disables the pop message, so it doesn't come up at all",
        takes: ''
      }
    },
    able: {
      set: /.+/gi,
      reset: null
    },
    set: async (message, arg, db, client) => {
      var cur = await db.get('msg')
      if (cur === null) {
        cur = 'Default'
      } else if (cur === false) {
        cur = 'Disabled'
      }
      sendSettings(client, message, {
        data: {
          setting: settings.msg.desc.name,
          then: cur,
          now: arg
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Set pop message to ${arg}`
        }
      }, (embed) => {
        db.set('msg', arg)
      })
    },
    reset: async (message, arg, db, client) => {
      var cur = await db.get('msg')
      if (cur === null) {
        cur = 'Default'
      } else if (cur === false) {
        cur = 'Disabled'
      }
      sendSettings(client, message, {
        data: {
          setting: settings.msg.desc.name,
          then: cur,
          now: 'Default'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Set pop message to default'
        }
      }, (embed) => {
        db.set('msg', null)
      })
    },
    disable: async (message, arg, db, client) => {
      var cur = await db.get('msg')
      if (cur === null) {
        cur = 'Default'
      } else if (cur === false) {
        cur = 'Disabled'
      }
      sendSettings(client, message, {
        data: {
          setting: settings.msg.desc.name,
          then: cur,
          now: 'Disabled'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Disabled pop message'
        }
      }, (embed) => {
        db.set('msg', false)
      })
    }
  },
  poptime: {
    desc: {
      name: 'Pop Message Delete Time',
      main: 'Change the amount of time it takes for the popup message to delete',
      current: async (client, db) => {
        var cur = await db.get('pop_delete')
        return cur === null ? 'Never' : `${cur / 1000} seconds`
      },
      set: {
        desc: "Set's the amount of time it takes to delete the message after it's sent",
        takes: ' [Time in Seconds]'
      },
      never: {
        desc: "Set's to never delete the pop message",
        takes: ''
      },
      reset: {
        desc: "Reset's the time to default time, (3 Seconds)",
        takes: ''
      }
    },
    able: {
      set: /^[0-9]+$/gi,
      never: null,
      reset: null
    },
    set: async (message, arg, db, client) => {
      var cur = await db.get('pop_delete')
      if (isNaN(arg)) return client.sendErr(message, 'Invalid number')
      var num = Number(arg)
      if (num < 1) return client.sendErr(message, 'Number must be at least 1 second')
      if (num >= 120) {
        var prem = await client.pdb.getAll(message.guild.id)
        if (!prem || !prem.premium) return client.sendErr(message, 'Number must be at or below 120 seconds, get premium for up to 600 seconds (`+premium`)')
        if (num >= 600) return client.sendErr(message, 'Number must be below 600 seconds.')
      }
      if (num < 1 || num > 120) return client.sendErr(message, 'Number must be between 1 and 120 (Seconds)')
      sendSettings(client, message, {
        data: {
          setting: settings.poptime.desc.name,
          then: cur === null ? 'Never' : `${cur / 1000} seconds`,
          now: `${num} seconds`
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Set pop time to ${num} seconds`
        }
      }, (embed) => {
        db.set('pop_delete', num * 1000)
      })
    },
    never: async (message, arg, db, client) => {
      var cur = await db.get('pop_delete')
      sendSettings(client, message, {
        data: {
          setting: settings.poptime.desc.name,
          then: `${cur / 1000} seconds`,
          now: 'Never'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Set pop time to never'
        }
      }, (embed) => {
        db.set('pop_delete', null)
      })
    },
    reset: async (message, arg, db, client) => {
      var cur = await db.get('pop_delete')
      sendSettings(client, message, {
        data: {
          setting: settings.poptime.desc.name,
          then: cur === null ? 'Never' : `${cur / 1000} seconds`,
          now: '3 seconds'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Set pop time to 3 seconds'
        }
      }, (embed) => {
        db.set('pop_delete', 3000)
      })
    }
  },
  filter: {
    desc: {
      name: 'Server Filter',
      main: 'The added on filter specific to this server',
      current: async (client, db) => {
        var cur = await db.get('filter')
        return `${cur.length > 0 ? cur.makeReadable() : 'Nothing'}`
      },
      add: {
        desc: 'Adds a word to the server filter',
        takes: ' [word]'
      },
      remove: {
        desc: "Removes a word that's been added to the server filter",
        takes: ' [added word]'
      },
      clear: {
        desc: 'Clears everything on the filter',
        takes: ''
      }
    },
    able: {
      add: /.+/gi,
      remove: /.+/gi,
      clear: null
    },
    add: async (message, arg, db, client) => {
      var current = await db.get('filter')
      var add = arg.split(' ')[0].toLowerCase()
      if (current.includes(add)) return client.sendErr(message, 'Already in filter')
      var res = client.filter.test(add, await db.get('base'))
      if (res.censor) return client.sendErr(message, 'This is already censored by the base filter (which is toggled on)')
      var emo = emojis.get(add)
      if (emo) {
        add = emo
        if (add.includes('_')) add = add.split('_')[0]
      }
      if (add.match(/<:.+:[0-9]+>/gi)) {
        add = add.split(':')[1]
      }
      if (add.match(/[^a-zA-Z0-9 ]/gi)) return client.sendErr(message, 'Invalid string! Make sure not to include any special characters')
      current.push(add)
      sendSettings(client, message, {
        data: {
          setting: settings.filter.desc.name,
          then: 'Added',
          now: add
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: `Added \`${add}\` to the server filter`
        }
      }, (embed) => {
        db.set('filter', current.filter(x => x))
      })
    },
    remove: async (message, arg, db, client) => {
      var current = await db.get('filter')
      var rem = arg.split(' ')[0].toLowerCase()
      if (!current.includes(rem)) return client.sendErr(message, 'Word is not in server filter')
      current[current.indexOf(rem)] = undefined
      sendSettings(client, message, {
        data: {
          setting: settings.filter.desc.name,
          then: 'Removed',
          now: rem
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: `Removed \`${rem}\` from the server filter`
        }
      }, (embed) => {
        db.set('filter', current.filter(x => x))
      })
    },
    clear: async (message, arg, db, client) => {
      var cur = await db.get('filter')
      sendSettings(client, message, {
        data: {
          setting: settings.filter.desc.name,
          then: 'Cleared',
          now: `${cur.length} words`
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: 'Cleared server filter'
        }
      }, (embed) => {
        db.set('filter', [])
      })
    }
  },
  uncensor: {
    desc: {
      name: 'Uncensor List',
      main: 'The uncensor list that removes words from the base filter, for your server',
      current: async (client, db) => {
        var cur = await db.get('uncensor')
        return `${cur.makeReadable()}`
      },
      add: {
        desc: 'Adds a word to the uncensor list',
        takes: ' [word]'
      },
      remove: {
        desc: "Removes a word that's been added to the uncensor list",
        takes: ' [added word]'
      },
      clear: {
        desc: 'Clears everything on the uncensor list',
        takes: ''
      }
    },
    able: {
      add: /.+/gi,
      remove: /.+/gi,
      clear: null,
      list: null
    },
    add: async (message, arg, db, client) => {
      var current = await db.get('uncensor')
      var add = arg.split(' ')[0].toLowerCase()
      if (current.includes(add)) return client.sendErr(message, 'Already in uncensor list')
      var res = client.filter.test(add, true)
      if (!res.censor) return client.sendErr(message, 'This is not censored by the base filter!')
      current.push(add)
      sendSettings(client, message, {
        data: {
          setting: settings.uncensor.desc.name,
          then: 'Added',
          now: add
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: `Added \`${add}\` to the uncensor list`
        }
      }, (embed) => {
        db.set('uncensor', current.filter(x => x))
      })
    },
    remove: async (message, arg, db, client) => {
      var current = await db.get('uncensor')
      var rem = arg.split(' ')[0].toLowerCase()
      if (!current.includes(rem)) return client.sendErr(message, 'Word is not in uncensor list')
      current[current.indexOf(rem)] = undefined
      sendSettings(client, message, {
        data: {
          setting: settings.uncensor.desc.name,
          then: 'Removed',
          now: rem
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: `Removed \`${rem}\` from uncensor list`
        }
      }, (embed) => {
        db.set('uncensor', current.filter(x => x))
      })
    },
    clear: async (message, arg, db, client) => {
      var cur = await db.get('uncensor')
      sendSettings(client, message, {
        data: {
          setting: settings.uncensor.desc.name,
          then: 'Cleared',
          now: `${cur.length} words`
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: 'Cleared uncensor list'
        }
      }, (embed) => {
        db.set('uncensor', [])
      })
    }
  },
  method: {
    desc: {
      name: 'Censor Method',
      main: 'Toggle methods the bot will censor',
      current: async (client, db) => {
        var cur = await db.get('censor')
        return `\n${Object.keys(cur).map(x => `    ${x}: ${cur[x] ? 'ON' : 'OFF'}`).join('\n')}`
      },
      msg: {
        desc: 'Toggles the normal message filter',
        takes: ''
      },
      emsg: {
        desc: 'Toggles the edited message filter',
        takes: ''
      },
      nick: {
        desc: 'Toggles the nickname filter',
        takes: ''
      },
      react: {
        desc: 'Toggles the reaction filter',
        takes: ''
      }
    },
    able: {
      msg: null,
      emsg: null,
      nick: null,
      react: null
    },
    msg: async (message, arg, db, client) => {
      var a = !(await db.get('censor')).msg
      sendSettings(client, message, {
        data: {
          setting: 'Censor Method (Normal Message)',
          then: a ? 'OFF' : 'ON',
          now: a ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled normal message filter ${a ? 'on' : 'off'}`
        }
      }, (embed) => {
        db.set('censor.msg', a)
      })
    },
    emsg: async (message, arg, db, client) => {
      var a = !(await db.get('censor')).emsg
      sendSettings(client, message, {
        data: {
          setting: 'Censor Method (Edited Message)',
          then: a ? 'OFF' : 'ON',
          now: a ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled edited message filter ${a ? 'on' : 'off'}`
        }
      }, (embed) => {
        db.set('censor.emsg', a)
      })
    },
    nick: async (message, arg, db, client) => {
      var a = !(await db.get('censor')).nick
      sendSettings(client, message, {
        data: {
          setting: 'Censor Method (Nickname)',
          then: a ? 'OFF' : 'ON',
          now: a ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled nickname filter ${a ? 'on' : 'off'}`
        }
      }, (embed) => {
        db.set('censor.nick', a)
      })
    },
    react: async (message, arg, db, client) => {
      var a = !(await db.get('censor')).react
      sendSettings(client, message, {
        data: {
          setting: 'Censor Method (Reaction)',
          then: a ? 'OFF' : 'ON',
          now: a ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled reaction filter ${a ? 'on' : 'off'}`
        }
      }, (embed) => {
        db.set('censor.react', a)
      })
    }
  },
  base: {
    desc: {
      name: 'Base Filter',
      main: 'Toggle the base filter on and off.',
      current: async (client, db) => {
        var cur = await db.get('base')
        return `${cur ? 'ON' : 'OFF'}`
      },
      on: {
        desc: "Set's base filter on",
        takes: ''
      },
      off: {
        desc: "Set's base filter off",
        takes: ''
      },
      toggle: {
        desc: 'Toggles the currently set value',
        takes: ''
      }
    },
    able: {
      on: null,
      off: null,
      toggle: null
    },
    on: async (message, arg, db, client) => {
      var cur = await db.get('base')
      sendSettings(client, message, {
        data: {
          setting: settings.base.desc.name,
          then: cur ? 'ON' : 'OFF',
          now: 'ON'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Turned Base Filter ON'
        }
      }, (embed) => {
        db.set('base', true)
        sendSettings(client, message, {
          data: {
            setting: settings.filter.desc.name,
            then: 'Cleared',
            now: 'all'
          },
          graves: {
            then: true,
            now: true
          },
          reply: {
            message: null
          }
        }, (embed) => {
          db.set('filter', [])
        })
      })
    },
    off: async (message, arg, db, client) => {
      var cur = await db.get('base')
      sendSettings(client, message, {
        data: {
          setting: settings.base.desc.name,
          then: cur ? 'ON' : 'OFF',
          now: 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Turned Base Filter OFF'
        }
      }, (embed) => {
        db.set('base', false)
      })
    },
    toggle: async (message, arg, db, client) => {
      var current = await db.get('base')
      var now = !current
      sendSettings(client, message, {
        data: {
          setting: settings.base.desc.name,
          then: current ? 'ON' : 'OFF',
          now: now ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled Base Filter ${now ? 'ON' : 'OFF'}${now ? ' (And cleared server filter)' : ''}`
        }
      }, (embed) => {
        db.set('base', now)
        if (now) {
          sendSettings(client, message, {
            data: {
              setting: settings.filter.desc.name,
              then: 'Cleared',
              now: 'all'
            },
            graves: {
              then: true,
              now: true
            },
            reply: {
              message: null
            }
          }, (embed) => {
            db.set('filter', [])
          })
        }
      })
    }
  },

  // punishments: {
  //     desc: "Set up punishments, after `x` times cursed, get `y` role",
  //     able: {

  //     },
  //     setamount: (message, arg, db, client) => {
  //         if(isNaN(arg)) return client.sendErr(message, "Invalid number");
  //         var num = Number(arg);
  //         if(num < 1) return client.sendErr(message, "Has to be more than 0");

  //     }
  // }
  role: {
    desc: {
      name: 'Uncensor Role',
      main: 'Role that will be ignored (can curse without getting censored)',
      current: async (client, db, guild) => {
        var cur = await db.get('role')
        var role = guild.roles.get(cur)
        return `@${role ? role.name : 'invalid-role'}`
      },
      set: {
        desc: "Set's the role to ignore",
        takes: ' @[role]'
      },
      remove: {
        desc: "Unignore's currently set role",
        takes: ''
      }
    },
    able: {
      set: /^<@&[0-9]+>/gi,
      remove: null
    },
    set: async (message, arg, db, client) => {
      var cur = await db.get('role')
      cur = message.guild.roles.get(cur) || 'NONE'
      var role = message.mentions.roles.first()
      if (!role) return client.sendErr(message, 'Invalid role')
      sendSettings(client, message, {
        data: {
          setting: settings.role.desc.name,
          then: `${cur}`,
          now: role
        },
        graves: {
          then: cur === 'NONE',
          now: false
        },
        reply: {
          message: `Set uncensor role to ${role}`
        }
      }, (embed) => {
        db.set('role', role.id)
      })
    },
    remove: async (message, arg, db, client) => {
      var cur = await db.get('role')
      cur = message.guild.roles.get(cur) || 'NONE'
      sendSettings(client, message, {
        data: {
          setting: settings.role.desc.name,
          then: `${cur}`,
          now: 'NONE'
        },
        graves: {
          then: cur === 'NONE',
          now: true
        },
        reply: {
          message: 'Removed uncensor role'
        }
      }, (embed) => {
        db.set('role', null)
      })
    }
  },
  resend: {
    premium: true,
    desc: {
      name: 'Webhook Resend',
      main: 'Resends deleted messages as the user who sent it, with the censored words deleted',
      current: async (client, db) => {
        var cur = await db.get('webhook')
        return `${cur ? 'ON' : 'OFF'}`
      },
      on: {
        desc: "Set's Webhook Resend on",
        takes: ''
      },
      off: {
        desc: "Set's Webhook Resend off",
        takes: ''
      },
      toggle: {
        desc: 'Toggles the currently set value',
        takes: ''
      }
    },
    able: {
      on: null,
      off: null,
      toggle: null
    },
    on: async (message, arg, db, client) => {
      var cur = await db.get('webhook')
      sendSettings(client, message, {
        data: {
          setting: settings.resend.desc.name,
          then: cur ? 'ON' : 'OFF',
          now: 'ON'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Turned Webhook Resend ON'
        }
      }, (embed) => {
        db.set('webhook', true)
      })
    },
    off: async (message, arg, db, client) => {
      var cur = await db.get('webhook')
      sendSettings(client, message, {
        data: {
          setting: settings.resend.desc.name,
          then: cur ? 'ON' : 'OFF',
          now: 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: 'Turned Webhook Resend OFF'
        }
      }, (embed) => {
        db.set('webhook', false)
      })
    },
    toggle: async (message, arg, db, client) => {
      var current = await db.get('webhook')
      var now = !current
      sendSettings(client, message, {
        data: {
          setting: settings.resend.desc.name,
          then: current ? 'ON' : 'OFF',
          now: now ? 'ON' : 'OFF'
        },
        graves: {
          then: true,
          now: true
        },
        reply: {
          message: `Toggled Webhook Resend ${now ? 'ON' : 'OFF'}`
        }
      }, (embed) => {
        db.set('webhook', now)
      })
    }
  },
  channels: {
    premium: true,
    desc: {
      name: 'Uncensor Channel',
      main: 'Ignore channels without having to make them NSFW',
      current: async (client, db) => {
        var cur = await db.get('channels')
        return `${cur.length > 0 ? cur.map(x => '#' + ((client.channels.get(x) || {}).name) || 'invalid-channel').makeReadable() : 'Nothing'}`
      },
      add: {
        desc: 'Adds a channel to the channel list',
        takes: ' #[channel]'
      },
      remove: {
        desc: "Removes a channel that's been added to the channel list",
        takes: ' #[added channel]'
      },
      clear: {
        desc: 'Clears all of the channels on the list',
        takes: ''
      }
    },
    able: {
      add: /<#[0-9]+>/gi,
      remove: /<#[0-9]+>/gi,
      clear: null
    },
    add: async (message, arg, db, client) => {
      var current = await db.get('channels')
      var add = message.mentions.channels.first()
      if (!add) return client.sendErr(message, 'Invalid channel')
      if (current.includes(add.id)) return client.sendErr(message, 'Channel already in list')
      current.push(add.id)
      sendSettings(client, message, {
        data: {
          setting: settings.channels.desc.name,
          then: 'Added',
          now: add
        },
        graves: {
          then: false,
          now: false
        },
        reply: {
          message: `Added ${add} to the ignored channel list`
        }
      }, (embed) => {
        db.set('channels', current.filter(x => x))
      })
    },
    remove: async (message, arg, db, client) => {
      var current = await db.get('channels')
      var rem = message.mentions.channels.first()
      if (!rem) return client.sendErr(message, 'Invalid channel')
      if (!current.includes(rem.id)) return client.sendErr(message, 'Channel is not in list')
      current[current.indexOf(rem.id)] = undefined
      sendSettings(client, message, {
        data: {
          setting: settings.filter.desc.name,
          then: 'Removed',
          now: rem
        },
        graves: {
          then: false,
          now: false
        },
        reply: {
          message: `Removed ${rem} from the ignore channel list`
        }
      }, (embed) => {
        db.set('channels', current.filter(x => x))
      })
    },
    clear: async (message, arg, db, client) => {
      var cur = await db.get('channels')
      sendSettings(client, message, {
        data: {
          setting: settings.channels.desc.name,
          then: 'Cleared',
          now: `${cur.length} channels`
        },
        graves: {
          then: false,
          now: true
        },
        reply: {
          message: 'Cleared channels list'
        }
      }, (embed) => {
        db.set('channels', [])
      })
    }
  }
}

const ignore = ['desc', 'able', 'name', 'main', 'current', 'premium']

function getLimit (obj, filter = (x) => { return x }, map = (x) => { return x }) {
  return Object.keys(obj).filter(filter).map(map).reduce((a, b) => { if ((a || '').length < b.length) { return b } else { return a } }).length + 1
}

exports.run = async (client, message, args, db) => {
  if (!args[0]) {
    // var str = `Change settings for this server!\n\nCategories:\n`;
    // var am = getLimit(settings);
    var embed = client.u.embed
      .setTitle('Change settings for this server')
    // .setDescription("Categories:")
      .setFooter("Do +settings [category] for more info. (Don't include []'s)")
      .setColor('ORANGE')

    // Object.keys(settings).forEach(key=>{
    //     embed.addField(key, settings[key].desc.main + "\n", true);
    // })

    var str = '__**Categories**__:\n\n'
    Object.keys(settings).forEach(key => {
      str += `**${key}**${settings[key].premium ? ' **`(PREMIUM)`**' : ''}\n__${settings[key].desc.main}__\n\n`
    })
    str += `(PREMIUM) = Features locked behind paywall, check out ${client.config.prefix}premium for more info\n\n`
    str += 'We recommend using the [dashboard](https://censorbot.jt3ch.net/dash)'
    embed.setDescription(str)
    // Object.keys(settings).forEach(key => {
    //     str += `  ${key}${" ".repeat(am-key.length)}=> ${settings[key].desc.main}\n\n`;
    // })

    // str += `\nDo ${client.config.prefix}settings [category] for more info\n(Do not include []'s)`
    // return message.channel.send(str, { code: true });
    return message.channel.send(embed)
  }
  var setting = settings[args[0].toLowerCase()]
  if (!setting) return client.sendErr(message, 'Invalid setting')
  if (setting.premium) {
    var prem = await client.pdb.getAll(message.guild.id)
    prem = prem || {}
    if (!prem.premium) return client.sendErr(message, `This is a premium only feature! Do \`${client.config.prefix}premium\` for more info!`)
  }
  if (!args[1]) {
    var current = await setting.desc.current(client, db, message.guild)
    var str = `${setting.desc.main}\n__Current: ${current}__\n\n__**Actions**__:\n\n`
    // var str = `${setting.desc.name} > ${setting.desc.main}\nCurrent: ${current}\n\nActions:\n`
    // var am = getLimit(setting.desc, x=>!ignore.includes(x), x=>`${x}${setting.desc[x].takes}`);

    var embed = client.u.embed
      .setTitle(setting.desc.name)
      .setFooter(`Do ${client.config.prefix}settings ${args[0]} [action] [value (if required)] (Do not include []'s)`)
      .setColor('ORANGE')

    Object.keys(setting.desc).filter(x => !ignore.includes(x)).forEach(key => {
      str += `**${key}**${setting.desc[key].takes}\n__${setting.desc[key].desc}__\n\n`
    })

    embed.setDescription(str)
    // Object.keys(setting.desc).filter(x=>!ignore.includes(x)).forEach(key=>{
    //     str += `  ${key+setting.desc[key].takes}${" ".repeat(am-(key+setting.desc[key].takes).length)}=> ${setting.desc[key].desc}\n`
    // });

    // str += `\nDo ${client.config.prefix}settings ${args[0]} [action] [value (if required)]\n(Do not include []'s)`
    return message.channel.send(embed)
  }
  if (!setting[args[1]] || ignore.includes(args[1])) return client.sendErr(message, 'Invalid setting action')
  var arg = args.join(' ').split(' ')
  arg.shift()
  arg.shift()
  arg = arg.join(' ')
  if ((!arg || arg === '') && setting.able[args[1]]) return client.sendErr(message, 'Missing value')
  if (setting.able[args[1]] && !arg.match(setting.able[args[1]])) return client.sendErr(message, 'Invalid setting value')
  setting[args[1]](message, arg, db, client)
}

exports.info = {
  name: 'settings',
  description: 'Change settings for the server',
  format: '{prefix}settings'
}
