import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param
} from '@nestjs/common'
import { ClusterStats } from 'jadl'
import { Config } from '../../config'
import { ThreadService } from '../services/thread.service'

@Controller('status')
export class StatusController {
  constructor(private readonly thread: ThreadService) {
    thread.on('STATUS_UPDATE', () => {
      this.cachedStats = null
    })
  }

  private cachedStats: ClusterStats[] | null = null

  @Get('/')
  async getStatus() {
    if (!this.cachedStats) {
      const stats = await this.thread.getStats()

      this.cachedStats = stats
      setTimeout(() => {
        this.cachedStats = null
      }, Config.dashboardOptions.wipeTimeout)
    }

    return this.cachedStats
  }

  @Get('/clusters/:clusterId')
  async getClusterStats(@Param('clusterId') clusterId: string) {
    const stats = await this.getStatus()

    const cluster = stats.find((x) => x.cluster.id === clusterId)
    if (!cluster)
      throw new HttpException('Cluster not found', HttpStatus.NOT_FOUND)

    return cluster
  }

  @Get('/shards/:shardId')
  async getShardStats(@Param('shardId') shardId: string) {
    const stats = await this.getStatus()

    const shard = stats
      .map((x) => x.shards)
      .flat()
      .find((x) => x.id === Number(shardId))
    if (!shard) throw new HttpException('Shard not found', HttpStatus.NOT_FOUND)

    return shard
  }
}
