import { Page, PageInterface } from "../structures/Page";

export class PremiumSettings extends Page implements PageInterface {
  name = 'premium_settings'
  url = /^\/dashboard\/premium$/

  async go () {}

  async remove () {
    return true
  }
}