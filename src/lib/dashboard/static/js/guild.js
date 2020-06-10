
/* global $ */
/* eslint-disable no-undef, no-unused-vars */
var openSection = null
function toggleSection (section) {
  $(section).children('section').slideToggle()
  if ($(section).attr('data-open') === 'false') {
    $(section).attr('data-open', true)
  } else {
    $(section).attr('data-open', false)
  }
}

function showChangeBar (params) {
  $('changes').removeClass('hidden')
}

function hideChangeBar () {
  $('changes').addClass('hidden')
}

$('input, select, button').each((i, e) => {
  e.addEventListener('change', () => window.lib.update())
  e.addEventListener('keyup', () => window.lib.update())
  e.addEventListener('click', () => window.lib.update())
})

$('#mainGuildPage').children('div').each(function () {
  $(this).children('h1').on('click', function () {
    window.lib.update()
    if (openSection === $(this).parent()[0] || openSection == null) {
      toggleSection($(this).parent())
      if (openSection == null) {
        openSection = $(this).parent()[0]
      } else {
        openSection = null
      }
    } else {
      toggleSection(openSection)
      toggleSection($(this).parent())
      openSection = $(this).parent()[0]
    }
  })
})

$('#punishmentSelect').children('select').on('change', function () {
  if ($(this).val() !== '1') {
    $('#muteSelect').fadeOut()
  } else {
    $('#muteSelect').fadeIn()
  }
})

if (!window.premium) {
  $('[premium]').each((i, e) => {
    e.setAttribute('disabled', '')
    e.setAttribute('readonly', '')
    console.log(e)
    if ($(e).parent().children('.slider')[0]) {
      $(e).parent().children('.slider')[0].setAttribute('disabled', '')
    }

    e.parentElement.addEventListener('click', () => {
      document.getElementById('server').focus()
      window.lib.tell('You need premium to do this!')
    })
  })
}
