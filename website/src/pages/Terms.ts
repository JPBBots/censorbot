import { Page, PageInterface } from "../structures/Page";

export class Terms extends Page implements PageInterface {
  name = 'terms'
  url = /terms/

  async go () {}

  async remove () {
    return true
  }
}