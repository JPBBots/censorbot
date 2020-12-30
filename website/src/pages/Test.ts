import { Page, PageInterface } from "../structures/Page";

export class Test extends Page implements PageInterface {
  name = 'test'
  url = /test/

  async go () {}

  async remove () {
    return true
  }
}