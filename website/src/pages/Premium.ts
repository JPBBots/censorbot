import { Page, PageInterface } from "../structures/Page";

export class Premium extends Page implements PageInterface {
  name = 'premium'
  url = /premium/

  async go () {}

  async remove () {
    return true
  }
}