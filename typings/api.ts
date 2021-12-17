import { Snowflake } from "discord-api-types";

export const filters = ["en", "es", "off", "de", "ru"] as const;

export type filterType = typeof filters[number];

export enum PunishmentType {
  Nothing = 0,
  Mute,
  Kick,
  Ban,
}

export type TimedPunishments = PunishmentType.Ban | PunishmentType.Mute;

export enum PremiumTypes {
  Premium = "premium",
  SuperPremium = "super-premium",
  OwnInstance = "own-instance",
}

export enum WebhookReplace {
  Spoilers = 0,
  Hashtags,
  Stars,
}

export enum CensorMethods {
  Messages = 1,
  Names = 2,
  Reactions = 4,
}

export interface Punishment {
  /**
   * Type of punishment
   */
  type: PunishmentType;
  /**
   * How many times a user has to curse
   */
  amount: number;
  /**
   * What role they get if it's a mute
   */
  role: Snowflake | null;
  /**
   * Amount of time to keep the punishment going
   */
  time: number | null;
  /**
   * How long the amount has to expire
   */
  expires: number | null;
  /**
   * Whether or not to retain a users role over a mute
   */
  retainRoles: boolean;
}

export enum ExceptionType {
  Everything,
  ServerFilter,
  PreBuiltFilter,
  Punishment,
  Resend,
  Response,
  Invites,
}

export interface Exception {
  role: Snowflake | null;
  channel: Snowflake | null;
  type: ExceptionType;
}
export interface GuildDB {
  /**
   * ID of guild
   */
  id?: Snowflake;
  /**
   * Filters being used
   */
  filters: filterType[];
  /**
   * Censor options
   */
  censor: number;
  nickReplace: string;
  removeNick: boolean;

  exceptions: Exception[];
  /**
   * Log channel ID
   */
  log: Snowflake | null;
  /**
   * List of words to filter
   */
  filter: string[];
  /**
   * List of words to uncensor
   */
  uncensor: string[];
  /**
   * List of phrases to filter
   */
  phrases: string[];
  /**
   * Exact words to filter
   */
  words: string[];
  /**
   * Whether to antihoist users
   */
  antiHoist: boolean;
  /**
   * Popup message options
   */
  msg: {
    /**
     * Message to send
     */
    content: string | false | null;
    /**
     * Delete after x ms
     */
    deleteAfter: number | false;
    /**
     * Whether or not to DM popup messages
     */
    dm: boolean;
  };
  /**
   * Punishment settings
   */
  punishment: Punishment;
  /**
   * Webhook options
   */
  webhook: {
    enabled: boolean;
    separate: boolean;
    replace: WebhookReplace;
  };
  multi: boolean;
  prefix: string | null;
  nsfw: boolean;
  invites: boolean;
  dm: boolean;

  toxicity: boolean;
  images: boolean;
  ocr: boolean;
  phishing: boolean;

  /**
   * Whether or not the entry is in the database or not
   */
  notInDb?: boolean;
}

export interface UserPremium {
  /**
   * Amount of premium servers this user has
   */
  count: number;
  /**
   * Guilds that are premium for this users
   */
  guilds: Snowflake[];
  /**
   * Whether or not a user is a customer or a patron
   */
  customer: boolean;
}

export interface User {
  /**
   * Censor Bot API Token
   */
  token: string;
  /**
   * ID of user
   */
  id: Snowflake;
  /**
   * Username#discriminator of user
   */
  tag: string;
  /**
   * Avatar hash
   */
  avatar: string | null;
  /**
   * Premium data
   */
  premium?: UserPremium;
  /**
   * Whether or not user is admin
   */
  admin?: boolean;
  /**
   * Email of the user
   */
  email?: string | null;

  _id?: string;
  bearer?: string;
}

export interface ShortGuild {
  /**
   * ID of guild
   */
  id: Snowflake;
  /**
   * Name of guild
   */
  name: string;
  /**
   * CDN Hash of icon
   */
  icon: string | null;
}

export interface DashboardChannel {
  id: Snowflake;
  name: string;
  type: number;
  parent_id?: Snowflake | null;
}

export interface DashboardRole {
  id: Snowflake;
  name: string;
  color: number;
}

export interface ExtendedGuild extends ShortGuild {
  /**
   * Array of channels
   */
  channels: DashboardChannel[];
  /**
   * Array of roles
   */
  roles: DashboardRole[];
}

export interface GuildData {
  /**
   * Guild data
   */
  guild: ExtendedGuild;
  /**
   * Whether or not guild is premium
   */
  premium: boolean;
  /**
   * Database data
   */
  db: GuildDB;
}

export interface Cluster {
  memory: number;
  uptime: number;
  id: number;
}
export interface Shard {
  events: number;
  id: number;
  ping: number;
  state: 0 | 1 | 2;
  connected: boolean;
  guilds: number;
}

export type AdminResponse = {
  cluster: Cluster;
  shards: Shard[];
}[];

/**
 * 3 character temporary identifier
 */
export type ShortID = `${string}${string}${string}`;

export interface Ticket {
  id: ShortID;
  word: string;
  user: Snowflake;
  admin?: Snowflake;
  msg?: Snowflake;
  accepted: boolean;
}

export interface TicketTest {
  censored: boolean;
  places: string[];
}
