import { Page, PageInterface } from "../../structures/Page";

export class DashboardTwitch extends Page implements PageInterface {
  name = 'dashboard_twitch'
  url = /^\/dashboard\/twitch$/

  async go () {}

  async remove () {
    return true
  }
}