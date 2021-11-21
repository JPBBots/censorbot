/* eslint-disable @typescript-eslint/no-namespace */
import { Api } from './structures/Api'

declare global {
  namespace NodeJS {
    interface Global {
      api: Api
      Chargebee: any
    }
  }
}

interface ChargebeeProduct {
  _: null
}

export interface ChargebeeWeb {
  createChargebeePortal: () => {
    open: (opt?: { close?: () => void | Promise<void> }) => void
  }

  getCart: () => {
    replaceProduct: (product: ChargebeeProduct) => void
    customer: {
      email: string
    }
  }

  initializeProduct: (id: string) => ChargebeeProduct

  openCheckout: (opt: {}) => void
}

export enum ChannelType {
  /**
   * A text channel within a guild
   */
  GuildText = 0,
  /**
   * A direct message between users
   */
  DM = 1,
  /**
   * A voice channel within a guild
   */
  GuildVoice = 2,
  /**
   * A direct message between multiple users
   */
  GroupDM = 3,
  /**
   * An organizational category that contains up to 50 channels
   *
   * See https://support.discord.com/hc/en-us/articles/115001580171-Channel-Categories-101
   */
  GuildCategory = 4,
  /**
   * A channel that users can follow and crosspost into their own guild
   *
   * See https://support.discord.com/hc/en-us/articles/360032008192
   */
  GuildNews = 5,
  /**
   * A channel in which game developers can sell their game on Discord
   *
   * See https://discord.com/developers/docs/game-and-server-management/special-channels
   */
  GuildStore = 6,
  /**
   * A thread channel (public) within a Guild News channel
   */
  GuildNewsThread = 10,
  /**
   * A public thread channel within a Guild Text channel
   */
  GuildPublicThread = 11,
  /**
   * A private thread channel within a Guild Text channel
   */
  GuildPrivateThread = 12,
  /**
   * A voice channel for hosting events with an audience
   *
   * See https://support.discord.com/hc/en-us/articles/1500005513722
   */
  GuildStageVoice = 13
}
