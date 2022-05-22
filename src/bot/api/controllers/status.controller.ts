import { Controller, Get, Param } from '@nestjs/common'
import { StatusService } from '../services/status.service'

@Controller('/api/status')
export class StatusController {
  constructor(private readonly status: StatusService) {}

  @Get('/')
  async getStatus() {
    return await this.status.getStatus()
  }

  @Get('/clusters/:clusterId')
  async getClusterStats(@Param('clusterId') clusterId: string) {
    return await this.status.getClusterStats(clusterId)
  }

  @Get('/shards/:shardId')
  async getShardStats(@Param('shardId') shardId: string) {
    return await this.status.getShardStats(shardId)
  }
}
