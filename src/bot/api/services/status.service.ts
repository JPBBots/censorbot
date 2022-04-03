import { EventEmitter } from '@jpbberry/typed-emitter'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ClusterStats, Snowflake, State } from 'jadl'
import { Config } from '../../config'
import { guildShard } from '../../utils/Discord'
import { ThreadService } from './thread.service'
import { CacheService } from './cache.service'

@Injectable()
export class StatusService extends EventEmitter<{
  CLEAR_CACHE: null
}> {
  constructor(
    private readonly thread: ThreadService,
    private readonly cache: CacheService
  ) {
    super()

    thread.on('STATUS_UPDATE', async () => {
      this.cachedStats = null

      const shards = await this.getShards()
      if (!this.connected && shards.every((s) => s.state === State.CONNECTED)) {
        this.connected = true

        this.cache.userGuilds.clear()
        this.emit('CLEAR_CACHE', null)
      }
    })
  }

  private connected = false

  private cachedStats: ClusterStats[] | null = null

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

  async getClusterStats(clusterId: string) {
    const stats = await this.getStatus()

    const cluster = stats.find((x) => x.cluster.id === clusterId)
    if (!cluster)
      throw new HttpException('Cluster not found', HttpStatus.NOT_FOUND)

    return cluster
  }

  async getShards() {
    const stats = await this.getStatus()

    return stats.map((x) => x.shards).flat()
  }

  async getShardStats(shardId: string) {
    const shards = await this.getShards()

    const shard = shards.find((x) => x.id === Number(shardId))
    if (!shard) throw new HttpException('Shard not found', HttpStatus.NOT_FOUND)

    return shard
  }

  async getShardForGuild(id: Snowflake) {
    const shards = await this.getShards()

    return shards.find((shard) => shard.id === guildShard(id, shards.length))
  }
}
