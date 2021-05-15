import { Logger } from "../../structures/Logger";
import { Page, PageInterface } from "../../structures/Page";

import { PremiumTypes, RegisterResponse } from '@typings/api'

export class Payment extends Page implements PageInterface {
  name = 'payment'
  url = /payment/
  fetchElements = [
    'status',
    'info',
    'extra'
  ]
  needsAuth = true

  get customerId (): string|null {
    return new URLSearchParams(window.location.search).get('customer_id')
  }
  
  async run () {
    let res: RegisterResponse

    this.util.presentLoad('Verifying your purchase, please wait!')

    for (let i = 0; i < 10; i++) {
      this.log(`Attempt ${i} to verify sub`)
      const req = await this.api.request(false, 'POST', '/api/premium/chargebee/register', {
        id: this.api.user.id,
        customerId: this.customerId
      }) as RegisterResponse
      res = req
      if (!req.error) break
      if (req.error === 'Couldn\'t find subscription') {
        await this.util.wait(10e3)
        continue
      }

      break
    }

    if (res.error) {
      this.e('status').innerText = 'An error occured!'
      this.e('info').innerText = res.error
      this.e('extra').innerText = 'Please try reloading or reach out to our support server.'
    } else {
      this.e('status').innerText = 'Success! Thank you for supporting us!'

      if (res.sub !== PremiumTypes.OwnInstance) {
        this.e('info').innerText = `Recieved your premium tier! You can now set ${res.amount} servers as premium!`
      } else {
        this.e('info').innerText = 'To begin configuring your own instance, please join the support server.'
      }

      this.e('extra').innerText = `Your next payment is due on ${new Date(res.endDate).toLocaleDateString('en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
      )}.\nYou can also join the support server to get some cool roles and get some help.`
    }

    this.api.user.premium.count = res.amount

    this.util.stopLoad()
  }

  async go () {
    if (!this.customerId) {
      Logger.tell('Missing customer ID')
      return this.util.setPath('/')
    }

    this.run()
    return true
  }

  async remove () {
    const current = new URLSearchParams(location.search)
    current.delete('customer_id')
    history.pushState({}, null, `?${current.toString()}`)
    return true
  }
}