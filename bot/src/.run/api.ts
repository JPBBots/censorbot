import { NestFactory } from '@nestjs/core'

import { AppModule } from '../api/app.module'
import { Config } from '../config'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // logger: false
  })

  app.setGlobalPrefix('api')

  await app.listen(Config.dashboardOptions.port)
}
bootstrap()