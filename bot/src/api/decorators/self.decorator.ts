import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Snowflake } from 'jadl'
import { SocketConnection } from '../gateway/user.gateway'

export interface SelfData {
  userId?: Snowflake
  subscribedGuild?: Snowflake
}

export const Self = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const con = ctx.switchToWs().getClient<SocketConnection>()

    if (!con.data) con.data = {}

    return con.data
  }
)
