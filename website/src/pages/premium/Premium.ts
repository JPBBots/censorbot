import { Logger } from "../../structures/Logger";
import { Page, PageInterface } from "../../structures/Page";

export class Premium extends Page implements PageInterface {
  name = 'premium'
  url = /premium/
  
  fetchElements = [
    'premium-section'
  ]

  async openCheckout (id: string) {
    if (!this.api.user || !this.api.user.email) {
      const res = await this.api.auth(false, true, false)
      if (!res || !this.api.user.email) return Logger.tell('Could not retrieve email')
    }
    if (this.api.user.premium.customer) {
      const res = confirm("You're already a customer! Press OK to go to the portal.")
      if (res) this.loader.chargebee.openPortal()

      return
    }

    this.loader.chargebee.getCart().replaceProduct(
      this.loader.chargebee.initializeProduct(id)
    )

    this.loader.chargebee.getCart().customer.email = this.api.user.email
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