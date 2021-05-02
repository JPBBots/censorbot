import { Landing } from "./Landing";
import { Premium } from './Premium'

import { Admin } from './admin/Admin'
import { Test } from './admin/Test'
import { Tickets } from './admin/Tickets'

import { DashboardGuilded } from './dashboards/Guilded'
import { DashboardDiscord } from './dashboards/Discord'
import { DashboardTwitch } from './dashboards/Twitch'

import { DiscordSettings } from './dashboards/settings/Discord'

import { e404 } from './errors/404'

export const Pages = [
  Landing,
  e404,
  Test,
  DiscordSettings,
  Premium,
  DashboardTwitch,
  DashboardGuilded,
  DashboardDiscord,
  Admin,
  Tickets
]
