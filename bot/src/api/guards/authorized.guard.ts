import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SocketConnection } from '../gateway/user.gateway'

import { MESSAGE_METADATA } from '@nestjs/websockets/constants'

@Injectable()
export class GatewayAuthGuard implements CanActivate {
  constructor (private readonly reflector: Reflector) {}

  getEvent (context: ExecutionContext) {
    return this.reflector.get(MESSAGE_METADATA, context.getHandler())
  }

  canActivate (context: ExecutionContext): boolean {
    const sock = context.switchToWs().getClient<SocketConnection>()

    // sock.emit('ERROR', { message: 'Unauthorized' })

    console.log(context.getHandler()())

    if (sock.data.userId !== 'a') {
      sock.emit(this.getEvent(context), { error: 'test' })

      return false
    }

    return true
  }
}
