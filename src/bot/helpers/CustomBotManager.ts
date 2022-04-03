import { ThreadComms } from 'jadl/dist/clustering/ThreadComms'
import { CustomBotOptions } from 'typings'

import { Worker } from 'worker_threads'
import path from 'path'
import { formatBotOptions } from 'jadl/dist/utils/formatBotOptions'
import { MasterManager } from '../managers/Master'
import { APIGuild, Snowflake } from 'discord-api-types/v9'

export class CustomBotManager extends ThreadComms {
  public id: string
  constructor(
    master: MasterManager,
    public readonly options: CustomBotOptions
  ) {
    super()

    this.id = options.name

    this.once('BEGIN', () => {
      void this.sendCommand('START', {
        shards: [0],
        options: formatBotOptions({
          token: options.token,
          ws: master.options.ws,
          shards: 1
        })
      })
    })
    this.on('REGISTER_SHARD', ({ id }, resolve) => {
      void this.sendCommand('START_SHARD', { id })
      resolve({})
    })

    const worker = new Worker(path.resolve(__dirname, '../.run/custombot.js'), {
      workerData: {
        id: options.name,
        custom: false
      }
    })

    this.register(worker)
  }

  /**
   * Restarts a shard
   * @param id ID of shard to restart
   */
  restartShard(id: number): void {
    this.tell('RESTART_SHARD', { id })
  }

  /**
   * Gets a guild from the clusters cache
   * @param id ID of guild
   */
  async getGuild(id: Snowflake): Promise<APIGuild> {
    return await this.sendCommand('GET_GUILD', { id })
  }

  /**
   * Evals code on the cluster
   * @param code Code to eval
   */
  async eval(code: string): Promise<any[]> {
    return await this.sendCommand('EVAL', code)
  }
}
