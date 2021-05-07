import { Logger } from "../../structures/Logger";
import { Page, PageInterface } from "../../structures/Page";

export class Premium extends Page implements PageInterface {
  name = 'premium'
  url = /premium/
  
  fetchElements = [
    'premium-section'
  ]

  async openCheckout (id: string) {
    if (!this.loader.api.user || !this.loader.api.user.email) {
      const res = await this.loader.api.auth(false, true, false)
      if (!res || !this.loader.api.user.email) return Logger.tell('Could not retrieve email')
    }

    this.loader.chargebee.getCart().replaceProduct(
      this.loader.chargebee.initializeProduct(id)
    )

    this.loader.chargebee.getCart().customer.email = this.loader.api.user.email
    this.loader.chargebee.openCheckout({})
  }

  async go () {
    this.e('premium-section').querySelectorAll('div > a').forEach((button: HTMLAnchorElement) => {
      button.onclick = () => {
        void this.openCheckout(button.id)
      }
    })
  }

  async remove () {
    return true
  }
}