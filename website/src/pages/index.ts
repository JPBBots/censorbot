import { Landing } from "./Landing";

import { Premium } from './premium/Premium'
import { Payment } from './premium/Payment'

import { Test } from './admin/Test'
import { Tickets } from './admin/Tickets'

import { DashboardGuilded } from './dashboards/Guilded'
import { DashboardDiscord } from './dashboards/Discord'
import { DashboardTwitch } from './dashboards/Twitch'

import { DiscordSettings } from './dashboards/settings/Discord'

import { e404 } from './errors/404'

export const Pages = [
  Landing,

  Premium,
  Payment,

  Test,
  Tickets,
  DashboardTwitch,
  DashboardGuilded,
  DashboardDiscord,

  DiscordSettings,
  e404
]
