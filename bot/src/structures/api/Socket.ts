import { Server } from 'ws'
import { ApiManager } from '../../managers/Api'
import { Connection } from './Connection'

export class Socket extends Server {
  users: Set<Connection> = new Set()

  constructor (public manager: ApiManager) {
    super({
      port: 3191,
      clientTracking: false
    }, () => {
      manager.log('WS Open')
    })

    this.on('connection', (ws, req) => {
      if (!req.headers.origin) return ws.terminate()
      const user = new Connection(this, ws, req.headers.origin)

      this.users.add(user)
    })
  }
}
