import { InputProps } from '@chakra-ui/input'
import type { OptionProps } from '@jpbbots/censorbot-components'
import type { TagifySettings } from '@yaireo/tagify'
import { FaAt, FaHashtag } from 'react-icons/fa'
import type { IconType } from 'react-icons/lib'
import type { DeepPartial } from 'redux'
import { Logger } from 'structures/Logger'
import { CensorMethods, GuildData, WebhookReplace } from 'typings'
import type { SectionName } from './Sidebar'
import type { TagifyProps } from './Tagify'

export enum OptionType {
  Boolean = 0,
  Input,
  Tagify,
  BitBool,
  Select,
  Number
}

const baseListSettings: TagifySettings = {
  delimiters: /,/g,
  pattern: /^.{1,20}$/,
  callbacks: {
    invalid: (e) => {
      if (e.detail.message === 'pattern mismatch') Logger.error('Word cannot be over 20 characters long.')
      if (e.detail.message === 'number of tags exceeded') Logger.error('Reached max words. Get premium to get up to 1500!')
    }
  }
}

const listSettings = {
  ...baseListSettings,
  delimiters: /,|\s/g
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
        type: OptionType.Tagify,
        settings: ({ guild }) => ({
          whitelist: guild.r.map(x => ({ value: `@${x.name}`, id: x.id })),
          enforceWhitelist: true,
          callbacks: {
            invalid: (e) => {
              if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more roles')
            }
          }
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
        type: OptionType.Tagify,
        settings: ({ guild }) => ({
          whitelist: guild.c.map(x => ({ value: `#${x.name}`, id: x.id })),
          enforceWhitelist: true,
          callbacks: {
            invalid: (e) => {
              if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to add more channels')
            }
          }
        }),
        placeholder: 'Add channels'
      }
    ]
  },

  {
    title: 'Pre-made filters',
    description: 'Pick pre-made filters that apply for your needs',
    section: 'General',
    options: [
      {
        name: 'filters',
        type: OptionType.Tagify,
        settings: () => ({
          whitelist: [
            { id: 'en', value: 'English' },
            { id: 'es', value: 'Spanish' },
            { id: 'off', value: 'Offensive' },
            { id: 'de', value: 'German' },
            { id: 'ru', value: 'Russian' }
          ],
          enforceWhitelist: true
        }),
        placeholder: 'Add filters'
      }
    ]
  },
  {
    title: 'Server Filter',
    description: 'Simple words to resolve that add onto your servers\' filter',
    section: 'General',
    options: [
      {
        name: 'filter',
        type: OptionType.Tagify,
        settings: ({ premium }) => ({
          ...listSettings,
          maxTags: premium ? 1500 : 150
        }),
        placeholder: 'Add words'
      }
    ]
  },
  {
    title: 'Phrase Filter',
    description: 'Words to remove that contain any character, including spaces',
    section: 'General',
    options: [
      {
        name: 'phrases',
        type: OptionType.Tagify,
        settings: ({ premium }) => ({
          ...baseListSettings,
          maxTags: premium ? 1500 : 150
        }),
        placeholder: 'Add phrases'
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
        type: OptionType.Tagify,
        settings: ({ premium }) => ({
          ...listSettings,
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
        options: ({ guild }) => guild.c.map(x => ({
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
        name: 'webhook.replace',
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
        type: OptionType.Tagify,
        settings: ({ guild, premium }) => ({
          whitelist: guild?.r.map(x => ({ value: `@${x.name}`, id: x.id })),
          maxTags: premium ? Infinity : 0,
          enforceWhitelist: true,
          callbacks: {
            invalid: (e) => {
              if (e.detail.message === 'number of tags exceeded') Logger.error('You need premium to use this')
            }
          }
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
  DataOption<OptionType.Tagify, TagifyProps, {
    settings: (guild: GuildData) => TagifySettings
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
