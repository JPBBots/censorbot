import { Page, PageInterface } from "../../structures/Page";

export class DashboardGuilded extends Page implements PageInterface {
  name = 'dashboard_guilded'
  url = /^\/dashboard\/guilded$/

  async go () {}

  async remove () {
    return true
  }
}