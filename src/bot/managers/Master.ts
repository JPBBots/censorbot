import { Master, Cluster, Snowflake, ThreadEvents } from 'jadl'

import { GatewayIntentBits, ChannelType } from 'discord-api-types/v9'

import path from 'path'
import { Config } from '../config'
import { Database } from '../structures/Database'

import { MasterEvents } from '../helpers/MasterEvents'

import { Cache } from '@jpbberry/cache'
import { ShortID, CustomBotOptions } from '@censorbot/typings'

// import AutoPoster from 'topgg-autoposter'

import { Interface } from '@jpbbots/interface'
import { Requests } from '../helpers/Requests'

import { CustomBotManager } from '../helpers/CustomBotManager'

const int = new Interface(!Config.staging)

export class MasterManager extends Master {
  config = Config
  db = new Database()
  api: Cluster

  requests = new Requests(this.rest)

  public handleEvents = new MasterEvents(this)

  helpme: Cache<ShortID, { code: ShortID; id: Snowflake }> = new Cache(5e5)

  constructor() {
    super(path.resolve(__dirname, '../.run/worker.js'), {
      token: Config.token,
      cache: {
        channels: [
          ChannelType.GuildText,
          ChannelType.GuildNews,
          ChannelType.GuildVoice,
          ChannelType.GuildCategory
        ]
      },
      cacheControl: {
        guilds: [
          'name',
          'icon',
          'owner_id',
          'region',
          'unavailable',
          'member_count',
          'threads'
        ],
        channels: [
          'type',
          'name',
          'nsfw',
          'permission_overwrites',
          'parent_id'
        ],
        roles: ['managed', 'permissions', 'name', 'position', 'color']
      },
      intents:
        GatewayIntentBits.GuildMessages |
        GatewayIntentBits.Guilds |
        GatewayIntentBits.GuildMessageReactions |
        GatewayIntentBits.GuildMembers |
        GatewayIntentBits.GuildBans,

      log: (msg: string, cluster: Cluster) => {
        if (cluster?.id === 'API' && msg.startsWith('Started')) msg = 'Started'

        console.log(
          `%c${
            cluster
              ? `Cluster ${cluster.id}${' '.repeat(
                  // @ts-expect-error
                  this.longestName - cluster.id.length
                )}`
              : // @ts-expect-error
                `Master ${' '.repeat(Number(this.longestName) + 1)}`
          } | ${msg}`,
          'color: white'
        )
      }
    })

    if (!this.config.staging) {
      int.setupMaster(this, 'censorbot')

      // AutoPoster(Config.dbl, this)
    }

    this.api = this.spawnProcess(
      'API',
      path.resolve(__dirname, '../.run/api.js')
    )

    void this.start()

    if (!this.config.staging) {
      this.db.on('started', () => {
        void this.db
          .collection('custombots')
          .find({})
          .toArray()
          .then((x) => x.forEach((bot) => this.spawnCustomBot(bot)))
      })
    }
  }

  readonly customBots: CustomBotManager[] = []

  spawnCustomBot(bot: CustomBotOptions): void {
    const customBot = new CustomBotManager(this, bot)

    this.customBots.push(customBot)
  }

  tellAll<K extends keyof ThreadEvents>(
    event: K,
    data: ThreadEvents[K]['send'],
    all?: boolean
  ): any[] {
    return [
      ...super.tellAll(event, data, all),
      ...this.customBots.map((bot) => bot.tell(event, data))
    ]
  }

  async sendToAll<K extends keyof ThreadEvents>(
    event: K,
    data: ThreadEvents[K]['send'],
    all?: boolean
  ): Promise<Array<ThreadEvents[K]['receive']>> {
    return [
      ...(await super.sendToAll(event, data, all)),
      ...(await Promise.all(
        this.customBots.map(async (bot) => await bot.sendCommand(event, data))
      ))
    ]
  }

  guildToCluster(guildId: Snowflake): Cluster {
    const custom = this.customBots.find((x) =>
      x.options.guilds.includes(guildId)
    )

    if (custom) {
      return custom as unknown as Cluster
    }

    return super.guildToCluster(guildId)
  }
}
