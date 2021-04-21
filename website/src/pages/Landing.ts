import { Page, PageInterface } from "../structures/Page";

export class Landing extends Page implements PageInterface {
  name = 'landing'
  url = /^\/?$/
  fetchElements = [
     'logo',
     'scroll',
     'info'
  ]

  async go () {
    this.on('scroll', () => {
      this.e('logo').style.transform = `rotate(${-scrollY/6-60}deg)`

      if ((scrollY + innerHeight - 100) > this.e('info').getBoundingClientRect().top) {
        this.e('scroll').style.display = 'none'
      } else {
        this.e('scroll').style.removeProperty('display')
      }
    })

    this.e('logo').onanimationend = async () => {
      this.e('logo').classList.remove('rollon')
      this.e('logo').classList.remove('rolloff')
    
      this.e('logo').classList.add('slowdown')
      dispatchEvent(new Event('scroll'))

      await this.util.wait(500)
      this.e('logo').classList.remove('slowdown')
    }

    this.e('scroll').onclick = () => this.util.scroll('#info')
  }

  async remove () {
    this.e('logo').classList.add('rolloff')
    if (window.screen.width > 650) await this.util.wait(900)
    return true
  }
}