function buildObject () {
  var obj = {
    base: true,
    languages: [],
    censor: {
      react: true,
      msg: true,
      emsg: true,
      nick: true
    },
    channels: [

    ],
    filter: [

    ],
    log: null,
    msg: null,
    pop_delete: 3000,
    role: null,
    uncensor: [

    ],
    punishment: {
      amount: 3,
      role: '',
      type: 0
    },
    webhook: false,
    webhook_replace: 0,
    multi: false
  }

  obj.base = document.getElementById('base').checked
  var langs = document.querySelectorAll('.lang')
  var l = []
  for (var i = 0; i < langs.length; i++) {
    var lang = langs.item(i)
    if (lang.checked) l.push(lang.value)
  }
  obj.languages = l
  obj.censor = {
    msg: document.getElementById('censor-msg').checked || false,
    emsg: document.getElementById('censor-emsg').checked || false,
    nick: document.getElementById('censor-nick').checked || false,
    react: document.getElementById('censor-react').checked || false
  }
  obj.log = document.getElementById('log').value
  if (obj.log == 'null') obj.log = null
  obj.role = document.getElementById('role').value
  if (obj.role == 'null') obj.role = null
  obj.filter = [...document.getElementById('filter').children].map(x => x.value)
  obj.uncensor = [...document.getElementById('uncensor').children].map(x => x.value)
  obj.pop_delete = ['', 0, undefined].includes(document.getElementById('poptime').value) ? null : document.getElementById('poptime').value * 1000
  var msgtype = document.getElementById('msgtype').value
  obj.msg = msgtype == 1 ? null : msgtype == 2 ? false : document.getElementById('custommsg').value

  obj.punishment.amount = Number(document.getElementById('punishamount').value)
  if (obj.punishment.amount < 1) obj.punishment.amount = 3
  obj.punishment.type = parseInt(document.getElementById('punishtype').value) || 0
  if (obj.punishment.type === 1) obj.punishment.role = document.getElementById('punishrole').value
  else obj.punishment.role = null
  if (obj.punishment.role == 'null') obj.punishment.role = null
  obj.webhook = document.getElementById('resend').checked || false
  obj.channels = [...document.getElementById('channels').children].map(x => x.value)
  obj.multi = document.getElementById('multi').checked
  obj.webhook_replace = parseInt(document.getElementById('resendreplace').value)

  return obj
}

document.waitingChange = false

function causeChange () {
  console.log('change')
  if (isEquivalent(current, buildObject())) {
    document.waitingChange = false
    document.getElementById('save').classList.remove('show')
    document.getElementById('save').classList.add('hide')
  } else {
    document.waitingChange = true
    document.getElementById('save').classList.remove('hide')
    document.getElementById('save').classList.add('show')
  }
}

document.onkeydown = function (e) {
  if (e.key == 's' && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
    e.preventDefault()
    console.log('got ctrl+s')
    if (document.waitingChange) submit()
  }
}
