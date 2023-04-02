import { Controller, Get, HttpStatus } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

@Controller('/api')
export class BaseController {
  @Get('/')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns info on the HTTP Server'
  })
  getInfo() {
    return {
      hello: 'world',
      worker: 0, // TODO
      region: 'na'
    }
  }
}
