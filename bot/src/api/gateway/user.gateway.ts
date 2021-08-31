import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'

@WebSocketGateway({ path: '/ws' })
export class UserGateway {
  @SubscribeMessage('test')
  test (): void {
    console.log('Got test')
  }
}
