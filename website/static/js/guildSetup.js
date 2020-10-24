/* eslint-disable */

let doneSetup = false

function setup () {
  if (doneSetup) return

  window.addEventListener('click', (e) => {
    if (e.target.matches('[premium]') && !window.premium) {
      e.preventDefault()
      document.getElementById('root').focus()
      window.lib.tell('You need premium to do this!')
    }
  })

  window.lib._getElm('prefix').addEventListener("change", function () {
    if (this.value.length > 10) {
      this.value = ""
      window.lib.tell("Prefix cannot be more than 10 characters") // TODO tooltip
    }
  })

  window.lib._getElm('log').addEventListener("change", function () {
    if (this.value == "") this.value = "null"
  })

  window.lib._getElm('role').addEventListener("change", function () {
    if (this.value == "") this.value = "null"
  })

  window.lib.addTag('filters', {
    whitelist: [
      { id: "en", value: "English" },
      { id: "es", value: "Spanish" },
      { id: "off", value: "Offensive" },
      { id: 'de', value: 'German (BETA)' },
      { id: 'ru', value: 'Russian (BETA)' }
    ],
    enforceWhitelist: true,
    callbacks: {},
    dropdown: {
      enabled: 0
    }
  })

  var listSettings = {
    maxTags: window.premium ? 500 : 150,
    delimiters: /,|\s/g,
    pattern: /^.{1,20}$/,
    callbacks: {
      invalid: (e) => {
        console.log(`Error whilst adding tag: ${e.detail.message}`)
        if (e.detail.message == "pattern mismatch") window.lib.tell('Word cannot be over 20 characters long.')
        if (e.detail.message == "number of tags exceeded") window.lib.tell("Reached max words. Get premium to get up to 500!")
      } // TODO: make it so that this pops up above the input instead of an alert
    }
  }

  window.lib.addTag('filter', listSettings)
  window.lib.addTag('uncensor', listSettings)

  window.lib._getElm('msg.deleteAfter').addEventListener("change", function () {
    if (this.value > 600) this.value = window.premium ? '600' : '120'
    if (this.value > 120 && !window.premium) {
      this.value = 120
      window.lib.tell("Get premium to get up to 600 second poptime!") // TODO tooltip
    }
    if (this.value < 1) this.value = ""
  })

  window.lib._getElm('punishment.time').addEventListener("change", function () {
    const base = this.querySelector('[base]')
    if (base.value > 60) base.value = 60
    if (base.value < 1) base.value = ""
  })
  window.lib._getElm('punishment.expires').addEventListener("change", function () {
    const base = this.querySelector('[base]')
    if (base.value > 60) base.value = 60
    if (base.value < 1) base.value = ""
  })


  var elm = window.lib._getElm('msg.content')
  elm.onfocus = function () {
    if (['Off', 'Default'].includes(this.value)) this.value = ""
  }
  elm.onchange = function () {
    if (this.value.length > 100) {
      this.value = "Default"
      window.lib.tell("Cannot be more than 100 characters") // TODO tooltip
    }
  }
  elm.onblur = function () {
    if (this.value === "") this.value = "Default"
  }

  window.lib._getElm('punishment.amount').addEventListener("change", function () {
    if (this.value > 50) this.value = 50
    if (this.value < 1) this.value = 1
  })

  window.lib._getElm('punishment.type').addEventListener("change", function () {
    var role = window.lib._getElm('punishment.role')
    if (this.value == '1') role.disabled = false
    else {
      role.disabled = true
      role.value = "null"
    }

    var base = window.lib._getElm('punishment.time').querySelector('[base]')
    const multiply = window.lib._getElm('punishment.time').querySelector('[multiply]')
    if (this.value == '1' || this.value == '3') {
      base.disabled = false
      multiply.disabled = false
    } else {
      base.disabled = true
      multiply.disabled = true
      base.value = ''
    }
  })

  window.lib.addTag('channels', {
    whitelist: window.guild.c.map(x => ({ value: `#${x.name}`, id: x.id })),
    enforceWhitelist: true,
    maxTags: window.premium ? Infinity : 0,
    callbacks: {},
    dropdown: {
      enabled: 0,
      maxItems: window.guild.c.length
    }
  })

  document.querySelectorAll('section').forEach(e => {
    e.addEventListener('click', () => {
      lib.update()
    })
  })

  doneSetup = true
}
