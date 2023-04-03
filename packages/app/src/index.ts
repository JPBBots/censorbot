import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import '@censorbot/typings'
import { AppModule } from './app.module'
import Config from '@censorbot/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Censor Bot API')
    .setVersion(process.version)
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/swagger', app, document)

  await app.listen(Config.dashboardOptions.port)
}
bootstrap()
