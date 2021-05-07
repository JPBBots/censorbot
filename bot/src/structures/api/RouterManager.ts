import { ApiManager } from '../../managers/Api'
import { LoadRoutes } from '@jpbberry/load-routes'

import Path from 'path'

import Express from 'express'

export class RouterManager {
  app: Express.Application
  constructor (private readonly manager: ApiManager) {
    this.app = Express()

    this.app.use(Express.json())
    this.app.use(Express.urlencoded({
      extended: true
    }))

    const router = Express.Router()

    LoadRoutes(router, Path.resolve(__dirname, '../../routes'), this.manager)

    this.app.use('/api', router)
  }
}
