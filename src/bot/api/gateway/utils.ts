import { ShortGuild, User } from '@censorbot/typings'
import {
  CallHandler,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common'
import { Snowflake } from 'discord-api-types/v9'
import { Observable, of } from 'rxjs'
import { SocketConnection } from './user.gateway'
import { CacheService } from '../services/cache.service'
import { UsersService } from '../services/users.service'
import Collection from '@discordjs/collection'

export interface SelfData {
  userId?: Snowflake
  subscribedGuild?: Snowflake
}

export interface WsData {
  user?: User
}
class NullError extends Error {}

type SFI = SocketConnection & { sfiUser: User; sfiGuilds: ShortGuild[] }

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    private readonly caching: CacheService,
    private readonly users: UsersService
  ) {}

  requestCaches: Collection<string, Promise<User>> = new Collection()

  async intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>
  ): Promise<Observable<any>> {
    const con = ctx.switchToWs().getClient<SFI>()

    if (!con.data) con.data = {}

    let user = con.data.userId ? this.caching.users.get(con.data.userId) : null
    if (!user) {
      const res = await this.expectAuthorization(con).catch(
        (err: Error | NullError) => err
      )

      if (res instanceof NullError) {
        return of(null)
      } else if (res instanceof Error) {
        return of({ error: res.message })
      }

      user = res
    }

    con.sfiUser = user

    return next.handle()
  }

  async expectAuthorization(sock: SocketConnection) {
    const cachedPromise = this.requestCaches.get(sock.id)
    if (cachedPromise) return await cachedPromise

    const promise = new Promise<User>((resolve, reject) => {
      const cleanup = () => {
        this.requestCaches.delete(sock.id)
        clearTimeout(timeout)
        sock.off('disconnect', onDisconnect)
      }

      const timeout = setTimeout(() => {
        cleanup()

        sock.emit('FAILED_AUTHORIZATION', null)

        reject(new Error('Unauthorized'))
      }, 300000)

      sock.emit('AUTHORIZE', async (data) => {
        if (!data?.token || data?.cancel) {
          cleanup()

          return reject(new Error('Unauthorized'))
        }

        const user = await this.users
          .login(data.token)
          .catch((err: Error) => err)

        if (user instanceof Error) {
          cleanup()

          return reject(new Error(user.message))
        }

        sock.data.userId = user.id
        await sock.join(user.id)

        cleanup()

        resolve(user)
      })

      const onDisconnect = () => {
        cleanup()

        reject(new NullError())
      }

      sock.once('disconnect', onDisconnect)
    })

    this.requestCaches.set(sock.id, promise)

    return await promise
  }
}

export const Self = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const { sfiUser: user } = ctx.switchToWs().getClient<SFI>()

    return user
  }
)
export const SelfDat = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const con = ctx.switchToWs().getClient<SocketConnection>()

    return con.data
  }
)

@Injectable()
export class AdminInterceptor implements NestInterceptor {
  intercept(
    ctx: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const { sfiUser: user } = ctx.switchToWs().getClient<SFI>()

    if (!user.admin) return of({ error: 'Not admin' })

    return next.handle()
  }
}

@Injectable()
export class GuildsInterceptor implements NestInterceptor {
  constructor(private readonly users: UsersService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Promise<Observable<any>> {
    const con = context.switchToWs().getClient<SFI>()
    const { sfiUser: user } = con

    const guilds = await this.users.getGuilds(user)

    if (!guilds) return of({ error: 'Unauthorized' })

    con.sfiGuilds = guilds

    return next.handle()
  }
}

export const Guilds = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const con = ctx.switchToWs().getClient<SFI>()

    return con.sfiGuilds
  }
)
