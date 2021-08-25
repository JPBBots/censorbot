import { InputProps } from '@chakra-ui/input'
import type { OptionProps } from '@jpbbots/censorbot-components'

import { FaAt, FaFilter, FaHashtag } from 'react-icons/fa'
import type { IconType } from 'react-icons/lib'

import type { DeepPartial } from 'redux'

import { CensorMethods, GuildData, WebhookReplace } from 'typings'

import type { SectionName } from './Sidebar'

import FuzzySearch from 'fuzzy-search'
import { ChannelType } from '@/types'
import { TagProps } from '@chakra-ui/tag'
import { TagsSettings } from './Tags'

export enum OptionType {
  Boolean = 0,
  Input,
  Tags,
  BitBool,
  Select,
  Number
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
    section: 'Extras',
    options: [
      {
        name: 'antiHoist',
        label: 'Prevent users from hoisting with special characters to get on top of the member list',
        type: OptionType.Boolean
      }
    ]
  },

  {
    title: 'Toxicity Filter',
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
    section: 'AI',
    options: [
      {
        name: 'images',
        label: 'Improve Discord’s built-in image moderation with a more agressive AI',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'OCR - Optical Character Recognition',
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
    title: 'Ignored Roles',
    description: 'Roles that are excepted from filtered words and phrases',
    icon: FaAt,
    section: 'Exceptions',
    options: [
      {
        name: 'role',
        type: OptionType.Tags,
        settings: ({ guild }) => ({
          whitelist: guild.r.map(x => ({ value: `@${x.name}`, id: x.id }))
        }),
        placeholder: 'Add roles'
      }
    ]
  },
  {
    title: 'Ignored Channels',
    description: 'Channels that are excepted from filtered words and phrases',
    icon: FaHashtag,
    section: 'Exceptions',
    options: [
      {
        name: 'channels',
        type: OptionType.Tags,
        settings: ({ guild }) => ({
          whitelist: guild.c.filter(x => x.type === ChannelType.GuildText).map(x => ({ value: `#${x.name}`, id: x.id }))
        }),
        placeholder: 'Add channels'
      }
    ]
  },
  {
    title: 'Ignored Categories',
    description: 'Categories who\'s channels will be ignored',
    icon: FaFilter,
    premium: true,
    section: 'Exceptions',
    options: [
      {
        name: 'categories',
        type: OptionType.Tags,
        settings: ({ guild }) => ({
          whitelist: guild.c.filter(x => x.type === ChannelType.GuildCategory).map(x => ({ value: `${x.name}`, id: x.id }))
        }),
        placeholder: 'Add categories'
      }
    ]
  },

  {
    title: 'Pre-made filters',
    description: 'Pick pre-made filters that apply for your needs, created and maintained by the makers of Censor Bot',
    section: 'General',
    options: [
      {
        name: 'filters',
        type: OptionType.Tags,
        settings: () => ({
          whitelist: [{ id: 'en', value: 'English' },
            { id: 'es', value: 'Spanish' },
            { id: 'off', value: 'Offensive' },
            { id: 'de', value: 'German' },
            { id: 'ru', value: 'Russian' }
          ]
        }),
        placeholder: 'Add filters'
      }
    ]
  },
  {
    title: 'Server Filter',
    description: 'Simple words that are used up against an advanced resolution system, removes any special characters',
    section: 'General',
    options: [
      {
        name: 'filter',
        settings: ({ premium }) => ({
          maxTags: premium ? 1500 : 150,
          maxMessage: 'You need premium to add more words',
          maxLength: 20
        }),
        type: OptionType.Tags,
        placeholder: 'Add words'
      }
    ]
  },
  {
    title: 'Phrase Filter',
    description: 'Advanced phrases/combinations that are not resolved like the server filter, allows spaces',
    section: 'General',
    options: [
      {
        name: 'phrases',
        type: OptionType.Tags,
        settings: ({ premium }) => ({
          maxLength: 50,
          allowSpaces: true,
          maxMessage: 'You need premium to add more words',
          maxTags: premium ? 1500 : 150
        }),
        placeholder: 'Add phrases'
      }
    ]
  },
  {
    title: 'Word Filter',
    description: 'Similar to the phrase filter except that it matches anything between spaces and if the word doesn\'t exactly match a single word it wont censor',
    section: 'General',
    options: [
      {
        name: 'words',
        type: OptionType.Tags,
        settings: ({ premium }) => ({
          maxLength: 20,
          maxMessage: 'You need premium to add more words',
          maxTags: premium ? 1500 : 150
        }),
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
        settings: ({ premium }) => ({
          maxLength: 20,
          maxMessage: 'You need premium to add more words',
          maxTags: premium ? 1500 : 150
        }),
        placeholder: 'Add words'
      }
    ]
  },
  {
    title: 'Censor Methods',
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
        label: 'Respond to bot commands in a user\'s Direct Messages rather than publicly',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'Log Channel',
    description: 'Channel to log all curses and punishments',
    section: 'Bot',
    options: [
      {
        name: 'log',
        type: OptionType.Select,
        allowNone: true,
        options: ({ guild }) => guild.c.filter(x => x.type === ChannelType.GuildText).map(x => ({
          value: x.id,
          name: `#${x.name}`
        }))
      }
    ]
  },

  {
    section: 'Resend',
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
    description: 'When disabled, will just censor the entire message',
    section: 'Resend',
    options: [
      {
        name: 'webhook.separate',
        label: 'Replace only bad words',
        type: OptionType.Boolean,
        premium: true
      }
    ]
  },
  {
    title: 'Replace With',
    section: 'Resend',
    premium: true,
    options: [
      {
        name: 'webhook.replace',
        type: OptionType.Select,
        number: true,
        options: () => [
          { value: WebhookReplace.Spoilers, name: 'Spoilers' },
          { value: WebhookReplace.Hashtags, name: 'Hashtags' },
          { value: WebhookReplace.Stars, name: 'Stars' }
        ]
      }
    ]
  },
  {
    title: 'Resend Ignored Roles',
    description: 'Roles to not send resend messages about',
    section: 'Resend',
    premium: true,
    options: [
      {
        name: 'webhook.ignored',
        type: OptionType.Tags,
        settings: ({ guild, premium }) => ({
          whitelist: guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
          maxTags: premium ? Infinity : 0
        }),
        placeholder: 'Add roles'
      }
    ]
  },

  {
    title: 'Message Content',
    description: 'What the message will say',
    section: 'Response',
    disable: {
      property: 'msg.content',
      disableValue: false,
      enableValue: 'You\'re not allowed to say that!'
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
    description: 'Time in seconds it will take until the response is automatically deleted',
    section: 'Response',
    disable: {
      property: 'msg.deleteAfter',
      disableButton: 'Never',
      disableValue: false,
      enableValue: 3000
    },
    options: [
      {
        name: 'msg.deleteAfter',
        type: OptionType.Number,
        multiplier: 1000
      }
    ]
  },
  {
    title: 'Response Ignored Channels',
    description: 'Channels that response messages will not show up in',
    icon: FaHashtag,
    section: 'Response',
    options: [
      {
        name: 'msg.ignoredChannels',
        type: OptionType.Tags,
        settings: ({ guild }) => ({
          whitelist: guild.c.filter(x => x.type === ChannelType.GuildText).map(x => ({ value: `#${x.name}`, id: x.id }))
        }),
        placeholder: 'Add channels'
      }
    ]
  },
  {
    title: 'Response Ignored Roles',
    description: 'Roles to not send responses about',
    section: 'Response',
    icon: FaAt,
    options: [
      {
        name: 'msg.ignoredRoles',
        type: OptionType.Tags,
        settings: ({ guild, premium }) => ({
          whitelist: guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
          maxTags: premium ? Infinity : 0
        }),
        placeholder: 'Add roles'
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

export const searcher = new FuzzySearch(settings, [
  'title',
  'section',
  'description',
  'options.name',
  'options.label',
  'options.description'
])

type DataOption<T extends OptionType, P extends {}, E = {}> = {
  name: string
  type: T
  props?: DeepPartial<P>
  premiumProps?: DeepPartial<P>
} & E

export type IOption =
  DataOption<OptionType.Boolean, OptionProps, { premium?: boolean, label: string }> |
  DataOption<OptionType.Input, JSX.IntrinsicElements['input'], {
    noneDisable?: boolean
    textarea?: boolean
    default?: string
  }> |
  DataOption<OptionType.Tags, TagProps, {
    settings: (guild: GuildData) => TagsSettings
    placeholder: string
  }> |
  DataOption<OptionType.BitBool, OptionProps, { bit: number, label: string }> |
  DataOption<OptionType.Select, JSX.IntrinsicElements['select'], {
    allowNone?: boolean
    number?: boolean
    options: (guild: GuildData) => Array<{ value: string | number, name: string }>
  }> |
  DataOption<OptionType.Number, InputProps, {
    multiplier?: number
  }>

export interface ISetting {
  title?: string
  section: SectionName
  description?: string
  premium?: boolean
  icon?: IconType
  options: IOption[]

  disable?: {
    property: string
    disableButton?: string
    enableButton?: string
    disableValue: any
    enableValue: any
  }
}
