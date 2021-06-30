import { ApiData } from './Api'
import _headlessData from './headlessData.json'

import { WebSocketEventMap } from 'typings/websocket'
import { api } from 'pages/_app'

const headlessData = _headlessData as ApiData

export default {
  AUTHORIZE: () => headlessData.user,
  GET_GUILDS: () => headlessData.guilds,
  SUBSCRIBE: () => headlessData.currentGuild,
  UNSUBSCRIBE: () => {},
  CHANGE_SETTING: (data) => {
    console.log(data)
    if (!headlessData.currentGuild) return

    headlessData.currentGuild = api._createUpdatedGuild(headlessData.currentGuild, data?.data)

    void api.ws._handleMessage({
      e: 'CHANGE_SETTING',
      d: data
    } as any)
  }
} as {
  [key in keyof WebSocketEventMap]?: (data?: WebSocketEventMap[key]['receive']) => WebSocketEventMap[key]['send']
}
