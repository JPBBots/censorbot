import { Controller, Get, HttpStatus, Param } from '@nestjs/common'
import { ApiProperty, ApiResponse } from '@nestjs/swagger'
import { Snowflake } from 'discord-api-types'
import { AmountObject, ChargeBeeService } from '../services/chargebee.service'

export class AmountAnnotation implements AmountObject {
  @ApiProperty({
    description: 'Amount of premium servers this user can add',
    example: 3
  })
  amount: number

  @ApiProperty({
    description:
      'Whether or not the user is a customer using the improved payment system',
    example: true
  })
  customer: boolean
}

@Controller('premium')
export class PremiumController {
  constructor(private readonly premium: ChargeBeeService) {}
  @Get('/:id')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retreives information on a users current premium status',
    type: AmountAnnotation
  })
  async getPremium(@Param('id') id: Snowflake) {
    const amount = await this.premium.getAmount(id)

    return amount
  }
}
