import { PermissionUtils } from '@/utils/Permissions'

import type { IconType } from 'react-icons/lib'

import type { DeepPartial } from 'redux'

import {
  CensorMethods,
  GuildData,
  WebhookReplace,
  FilterType,
  filterTypeNames
} from '@jpbbots/cb-typings'

import type { SectionName } from './Aside'

import FuzzySearch from 'fuzzy-search'
import { ChannelType } from '@/types'
import { TagsSettings } from './Tags'

export enum OptionType {
  Boolean = 0,
  Input,
  Tags,
  BitBool,
  Select,
  Number,
  Exception,
  Punishments,
  Time
}

export const settings: ISetting[] = [
  {
    title: 'Multi-Line',
    section: 'Extras',
    options: [
      {
        name: 'multi',
        label: 'Recognize text over multiple messages',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'Censor Invites',
    requiredPermission: 'manageMessages',
    section: 'Extras',
    options: [
      {
        name: 'invites',
        label: 'Remove any Discord server invites',
        type: OptionType.Boolean
      }
    ]
  },
  {
    title: 'Anti-Phishing',
    requiredPermission: 'manageMessages',
    section: 'Extras',
    options: [
      {
        name: 'phishing',
        label: 'Search every message for scam/phishing links and delete them',
        type: OptionType.Boolean
      }
    ]
  },
  {
    title: 'Ignore NSFW Channels',
    section: 'Extras',
    options: [
      {
        name: 'nsfw',
        label: 'Ignore messages in channels marked as NSFW',
        type: OptionType.Boolean
      }
    ]
  },
  {
    title: 'Anti-Hoist',
    requiredPermission: 'manageNicknames',
    section: 'Extras',
    options: [
      {
        name: 'antiHoist',
        label:
          'Prevent users from hoisting with special characters to get on top of the member list',
        type: OptionType.Boolean
      }
    ]
  },

  {
    title: 'Toxicity Filter',
    requiredPermission: 'manageMessages',
    section: 'AI',
    options: [
      {
        name: 'toxicity',
        label: 'Filter out toxic messages with AI',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'Anti-NSFW Images',
    requiredPermission: 'manageMessages',
    section: 'AI',
    options: [
      {
        name: 'images',
        label:
          'Improve Discord’s built-in image moderation with a more agressive AI',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'OCR - Optical Character Recognition',
    requiredPermission: 'manageMessages',
    section: 'AI',
    options: [
      {
        name: 'ocr',
        label: 'Scan and filter images with text',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },

  {
    title: 'Ignore Channels',
    section: 'Exceptions',
    description: 'List of channels to ignore',
    options: [
      {
        name: 'channels',
        type: OptionType.Tags,
        placeholder: 'Add channels',
        channel: true,
        maxTags: 5,
        premiumMaxTags: Infinity,
        fn: ({ guild }) => ({
          whitelist: guild.channels.map((x) => ({
            id: x.id,
            value: x.name
          }))
        })
      }
    ]
  },
  {
    title: 'Ignore Roles',
    section: 'Exceptions',
    description: 'List of roles to ignore',
    options: [
      {
        name: 'roles',
        type: OptionType.Tags,
        placeholder: 'Add roles',
        role: true,
        maxTags: 5,
        premiumMaxTags: Infinity,
        fn: ({ guild }) => ({
          whitelist: guild.roles.map((x) => ({
            id: x.id,
            value: x.name
          }))
        })
      }
    ]
  },

  {
    title: 'Advanced Exceptions',
    section: 'Exceptions',
    description:
      'List of exceptions that bypass the default nature of the bot based on specific circumstances',
    options: [
      {
        name: 'exceptions',
        type: OptionType.Exception
      }
    ]
  },

  {
    title: 'Punishments',
    section: 'Punishments',
    description: 'Punish users for doing things Censor Bot blocks',
    options: [
      {
        name: 'punishments.levels',
        type: OptionType.Punishments
      }
    ]
  },
  {
    title: 'Warning Expire Time',
    section: 'Punishments',
    description: 'Amount of time a warning exists',
    tooltip:
      "E.g 5 minutes means that after 5 minutes the warning will expire and doesn't count against the punishment",
    options: [
      {
        name: 'punishments.expires',
        type: OptionType.Time,
        max: 5184000000,
        times: [
          60e3, 300000, 600000, 3.6e6, 8.64e7, 6.048e8, 2629800000, 5259600000
        ],
        nullIs: 'Never'
      }
    ]
  },
  {
    title: 'Punish When',
    section: 'Punishments',
    description: 'Punish users when any of the following rules are triggered',
    options: Object.values(FilterType)
      .map((x) =>
        typeof x === 'number'
          ? {
              type: OptionType.BitBool,
              name: 'punishments.allow',
              label: filterTypeNames[x as FilterType],
              bit: x
            }
          : (null as any)
      )
      .filter((x) => x)
  },

  {
    title: 'Pre-made filters',
    requiredPermission: 'manageMessages',
    description:
      'Pick pre-made filters that apply for your needs, created and maintained by the makers of Censor Bot',
    section: 'General',
    options: [
      {
        name: 'filters',
        type: OptionType.Tags,
        whitelist: [
          { id: 'en', value: 'English' },
          { id: 'es', value: 'Spanish' },
          { id: 'off', value: 'Offensive' },
          { id: 'de', value: 'German' },
          { id: 'ru', value: 'Russian' }
        ],
        placeholder: 'Add filters'
      }
    ]
  },
  {
    title: 'Server Filter',
    requiredPermission: 'manageMessages',
    tooltip:
      'Matched up against an advanced character recognition system. All special/look-alike characters will be removed or replaced',
    description: 'Simple words that add on to the pre-built filters',
    section: 'General',
    options: [
      {
        name: 'filter',
        type: OptionType.Tags,
        maxMessage: 'You need premium to add more words',
        maxLength: 20,
        maxTags: 150,
        premiumMaxTags: 1500,
        placeholder: 'Add words'
      }
    ]
  },
  {
    title: 'Phrase Filter',
    requiredPermission: 'manageMessages',
    tooltip:
      'Allows spaces and exactly matches an entire message. Does not account for special characters (easily bypassable)',
    description: 'Advanced phrases/combinations to censor',
    section: 'General',
    options: [
      {
        name: 'phrases',
        type: OptionType.Tags,
        maxLength: 50,
        allowSpaces: true,
        maxMessage: 'You need premium to add more words',
        maxTags: 150,
        premiumMaxTags: 1500,
        placeholder: 'Add phrases'
      }
    ]
  },
  {
    title: 'Word Filter',
    requiredPermission: 'manageMessages',
    tooltip:
      'Only matches words that are surrounded by spaces, e.g if "hello" was in your word filter, "ahellob" would not be censored, but "a hello b" would',
    description: 'Full words to censor',
    section: 'General',
    options: [
      {
        name: 'words',
        type: OptionType.Tags,
        maxLength: 20,
        maxMessage: 'You need premium to add more words',
        maxTags: 150,
        premiumMaxTags: 1500,
        placeholder: 'Add words'
      }
    ]
  },
  {
    title: 'Uncensor List',
    description: 'Words to ignore when they’re matched against a filter',
    section: 'General',
    options: [
      {
        name: 'uncensor',
        type: OptionType.Tags,
        maxLength: 20,
        maxMessage: 'You need premium to add more words',
        maxTags: 150,
        premiumMaxTags: 1500,
        placeholder: 'Add words'
      }
    ]
  },
  {
    title: 'Censor Methods',
    requiredPermission: 'manageMessages',
    section: 'General',
    options: [
      {
        name: 'censor',
        label: 'Filter sent and edited messages',
        type: OptionType.BitBool,
        bit: CensorMethods.Messages
      },
      {
        name: 'censor',
        label: 'Filter usernames and nicknames',
        type: OptionType.BitBool,
        bit: CensorMethods.Names
      },
      {
        name: 'censor',
        label: 'Filter reactions on messages',
        type: OptionType.BitBool,
        bit: CensorMethods.Reactions
      },
      {
        name: 'censor',
        label: 'Filter thread names',
        type: OptionType.BitBool,
        bit: CensorMethods.Threads
      },
      {
        name: 'censor',
        label: 'Kick users with inappropriate profile pictures',
        type: OptionType.BitBool,
        bit: CensorMethods.Avatars,
        premium: true
      }
    ]
  },
  {
    title: 'Nickname Replacement',
    requiredPermission: 'manageNicknames',
    description: 'Nickname to set when a users nickname is inappropriate',
    section: 'General',
    options: [
      {
        name: 'nickReplace',
        type: OptionType.Input,
        max: 32
      }
    ]
  },
  {
    title: 'Remove Nickname',
    requiredPermission: 'manageNicknames',
    section: 'General',
    options: [
      {
        name: 'removeNick',
        label:
          'If a user has an inappropriate nickname, reset their name to their user account name',
        type: OptionType.Boolean
      }
    ]
  },

  {
    title: 'Prefix',
    description: 'A customized prefix that the bot will respond to',
    section: 'Bot',
    disable: {
      property: 'prefix',
      disableValue: null,
      enableValue: '+'
    },
    options: [
      {
        name: 'prefix',
        type: OptionType.Input,
        noneDisable: true
      }
    ]
  },
  {
    title: 'DM Commands',
    section: 'Bot',
    options: [
      {
        name: 'dm',
        label:
          "Respond to bot commands in a user's Direct Messages rather than publicly",
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'Log Channel',
    requiredPermission: 'sendMessages',
    description: 'Channel to log all curses and punishments',
    section: 'Bot',
    options: [
      {
        name: 'log',
        type: OptionType.Select,
        allowNone: true,
        channel: true,
        placeholder: 'Search #channel',
        options: ({ guild }) =>
          guild.channels
            .filter((x) => x.type === ChannelType.GuildText && !x.parent_id)
            .map((x) => ({
              value: x.id,
              label: x.name
            })),
        categories: ({ guild }) =>
          guild.channels
            .filter((x) => x.type === ChannelType.GuildCategory)
            .map((x) => ({
              name: x.name.toUpperCase(),
              children: guild.channels
                .filter((a) => a.parent_id === x.id)
                .map((b) => ({
                  label: b.name,
                  value: b.id
                }))
            }))
      }
    ]
  },

  {
    section: 'Resend',
    requiredPermission: 'webhooks',
    options: [
      {
        name: 'webhook.enabled',
        label: 'Enable resending deleted messages',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'Replace',
    section: 'Resend',
    description: 'Single out individual curses and replace them',
    premium: true,
    disable: {
      property: 'webhook.separate',
      disableValue: false,
      enableValue: true
    },
    options: [
      {
        name: 'webhook.replace',
        type: OptionType.Select,
        number: true,
        options: () => [
          { value: WebhookReplace.Spoilers, label: 'Spoilers' },
          { value: WebhookReplace.Hashtags, label: 'Hashtags' },
          { value: WebhookReplace.Stars, label: 'Stars' }
        ]
      }
    ]
  },

  {
    title: 'Message Content',
    requiredPermission: 'embed',
    description: 'What the message will say',
    section: 'Response',
    disable: {
      property: 'msg.content',
      disableValue: false,
      enableValue: "You're not allowed to say that!"
    },
    options: [
      {
        name: 'msg.content',
        type: OptionType.Input,
        noneDisable: true,
        textarea: true
      }
    ]
  },
  {
    title: 'Delete After',
    description:
      'Time it will take until the response is automatically deleted',
    section: 'Response',
    options: [
      {
        name: 'msg.deleteAfter',
        type: OptionType.Time,
        times: [3e3, 10e3, 60e3, 120e3],
        nullIs: 'Never',
        nullIsFalse: true,
        premiumProps: {
          times: [3e3, 10e3, 60e3, 120e3, 240e3, 600e3]
        }
      }
    ]
  },
  {
    title: 'Direct Message',
    section: 'Response',
    options: [
      {
        name: 'msg.dm',
        label: 'Send response to triggering user’s Direct Messages',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  }
]

export const searcher = new FuzzySearch(
  settings,
  [
    'title',
    'section',
    'description',
    'options.name',
    'options.label',
    'options.description',
    'options.tooltip'
  ],
  { sort: true }
)

type DataOption<T extends OptionType, E = {}> = {
  name: string
  type: T
  premiumProps?: DeepPartial<E>
} & E

export type IOption =
  | DataOption<OptionType.Boolean, { premium?: boolean; label: string }>
  | DataOption<
      OptionType.Input,
      {
        noneDisable?: boolean
        textarea?: boolean
        max?: number
        default?: string
      }
    >
  | DataOption<
      OptionType.Tags,
      TagsSettings & {
        fn?: (guild: GuildData) => DeepPartial<TagsSettings>
        premiumMaxTags?: number
        placeholder: string
      }
    >
  | DataOption<
      OptionType.BitBool,
      { bit: number; label: string; premium?: boolean }
    >
  | DataOption<
      OptionType.Select,
      {
        allowNone?: boolean
        number?: boolean
        placeholder?: string
        options?: (
          guild: GuildData
        ) => Array<{ value: string | number; label: string; color?: number }>
        categories?: (guild: GuildData) => Array<{
          name: string
          children: Array<{ value: string; label: string }>
        }>
        channel?: boolean
        role?: boolean
      }
    >
  | DataOption<
      OptionType.Number,
      {
        multiplier?: number
      }
    >
  | DataOption<OptionType.Exception, {}>
  | DataOption<OptionType.Punishments, {}>
  | DataOption<
      OptionType.Time,
      {
        max?: number
        nullIs?: string
        nullIsFalse?: boolean
        times: number[]
      }
    >

export interface ISetting {
  title?: string
  section: SectionName
  description?: string
  tooltip?: string
  premium?: boolean
  icon?: IconType
  requiredPermission?: keyof typeof PermissionUtils['bits']
  options: IOption[]

  disable?: {
    property: string
    disableButton?: string
    enableButton?: string
    disableValue: any
    enableValue: any
  }
}
