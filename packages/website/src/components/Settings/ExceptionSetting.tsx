import React from 'react'
import { GuildData, AdvancedException, ExceptionType } from '@censorbot/typings'

import { InlineOptionGroup } from './InlineOptionGroup'

import { HStack, Text } from '@chakra-ui/layout'
import { Icon } from '@chakra-ui/icon'
import { Select } from '@chakra-ui/select'
import { FaTrash } from 'react-icons/fa'

import type { DeepPartial } from 'redux'

export interface ExceptionSettingProps {
  guild: GuildData
  exception: AdvancedException
  first?: boolean
  onChange?: (data: AdvancedException) => void
  onDelete?: () => void
}

const ExceptionTypes = [
  {
    label: 'Everything',
    value: ExceptionType.Everything
  },
  {
    label: 'Server Filter',
    value: ExceptionType.ServerFilter
  },
  {
    label: 'Pre-built Filter',
    value: ExceptionType.PreBuiltFilter
  },
  {
    label: 'Invite Filter',
    value: ExceptionType.Invites
  },
  {
    label: 'Punishments',
    value: ExceptionType.Punishment
  },
  {
    label: 'Response Message',
    value: ExceptionType.Response
  },
  {
    label: 'Resends',
    premium: true,
    value: ExceptionType.Resend
  },
  {
    label: 'Anti-Hoist',
    value: ExceptionType.AntiHoist
  }
]

export function ExceptionSetting({
  guild,
  exception,
  onChange,
  onDelete,
  first
}: ExceptionSettingProps) {
  const change = (data: DeepPartial<AdvancedException>) => {
    onChange?.({
      ...exception,
      ...data
    })
  }

  return (
    <HStack flexWrap="wrap" w="full">
      <InlineOptionGroup>
        <Text>Anyone with</Text>
        <Select
          onChange={({ target }) =>
            change({ role: target.value === 'none' ? null : target.value })
          }
          value={exception.role ?? 'none'}
          w="200px"
          size="sm"
          maxW="20vw"
        >
          <option value="none">Any role</option>
          {guild.guild.roles.map((x) => (
            <option key={x.id} value={x.id}>
              @{x.name}
            </option>
          ))}
        </Select>

        <Text>in channel</Text>
        <Select
          onChange={({ target }) =>
            change({ channel: target.value === 'none' ? null : target.value })
          }
          value={exception.channel ?? 'none'}
          w="200px"
          size="sm"
          maxW="20vw"
        >
          <option value="none">Any channel</option>
          {guild.guild.channels.map((x) => (
            <option key={x.id} value={x.id}>
              #{x.name}
            </option>
          ))}
        </Select>

        <Text>bypasses</Text>
        <Select
          onChange={({ target }) => change({ type: Number(target.value) })}
          value={exception.type}
          w="200px"
          size="sm"
          maxW="20vw"
        >
          {ExceptionTypes.filter((x) => (x.premium ? guild.premium : true)).map(
            (x) => (
              <option key={x.value} value={x.value}>
                {x.label}
              </option>
            )
          )}
        </Select>

        <Icon
          cursor="pointer"
          fontSize={20}
          as={FaTrash}
          onClick={() => {
            onDelete?.()
          }}
        />
      </InlineOptionGroup>
    </HStack>
  )
}
