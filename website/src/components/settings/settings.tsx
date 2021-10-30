import { InputProps } from '@chakra-ui/input'
import type { OptionProps } from '@jpbbots/censorbot-components'

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
  Number,
  Exception
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
    title: 'Anti-Phishing',
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
    title: 'Exceptions',
    section: 'Exceptions',
    description: 'List of exceptions that bypass the default nature of the bot based on specific circumstances',
    options: [
      {
        name: 'exceptions',
        type: OptionType.Exception
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
    title: 'Nickname Replacement',
    description: 'Nickname to set when a users nickname is inappropriate',
    section: 'General',
    options: [
      {
        name: 'nickReplace',
        type: OptionType.Input,
        props: {
          maxLength: 32
        }
      }
    ]
  },
  {
    title: 'Remove Nickname',
    section: 'General',
    options: [
      {
        name: 'removeNick',
        label: 'If a user has an inappropriate nickname, reset their name to their user account name',
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
        channel: true,
        placeholder: 'Search #channel',
        options: ({ guild }) => guild.channels.filter(x => x.type === ChannelType.GuildText).map(x => ({
          value: x.id,
          label: x.name
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
    placeholder?: string
    options: (guild: GuildData) => Array<{ value: string | number, label: string, color?: number }>
    channel?: boolean
    role?: boolean
  }> |
  DataOption<OptionType.Number, InputProps, {
    multiplier?: number
  }> |
  DataOption<OptionType.Exception, {}, {}>

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
