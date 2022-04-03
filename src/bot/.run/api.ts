require('module-alias/register')
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from '../api/app.module'
import { Config } from '../config'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    logger: false
  })

  const config = new DocumentBuilder()
    .setTitle('Censor Bot API')
    .setDescription('Info for in and out Censor Bot dashboard / services')
    .setVersion(process.version)
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api/swagger', app, document)

  await app.listen(Config.dashboardOptions.port)
}
bootstrap()
