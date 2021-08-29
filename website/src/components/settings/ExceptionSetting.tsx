import { GuildData, Exception, ExceptionType } from '@/../../typings/api'
import { DeepPartial, HStack, Text, Icon } from '@chakra-ui/react'
import { InlineOptionGroup } from '@jpbbots/censorbot-components'
import React from 'react'
import { FaTrash } from 'react-icons/fa'
import { Selector } from '~/functional/Selector'

export interface ExceptionSettingProps {
  guild: GuildData
  exception: Exception
  first?: boolean
  onChange?: (data: Exception) => void
  onDelete?: () => void
}

export function ExceptionSetting ({ guild, exception, onChange, onDelete, first }: ExceptionSettingProps) {
  const change = (data: DeepPartial<Exception>) => {
    console.log(data)
    onChange?.({
      ...exception,
      ...data
    })
  }

  return <HStack>
    <InlineOptionGroup>
      <Text>Anyone with</Text>
      <Selector
        role
        value={exception.role}
        placeholder="Select @role"
        onChange={(role) => change({ role })}>
          {guild.guild.r.map(x => ({
            label: x.name,
            value: x.id,
            color: x.color
          }))}
      </Selector>

      <Text>in channel</Text>
      <Selector
        channel
        value={exception.channel}
        placeholder="Select #channel"
        onChange={(channel) => change({ channel })}>
          {guild.guild.c.map(x => ({
            label: x.name,
            value: x.id
          }))}
      </Selector>

      <Text>bypasses</Text>
      <Selector
        value={exception.type}
        placeholder="Select bypass"
        onChange={(type) => change({ type })}>
          {
            [
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
                label: 'Punishments',
                value: ExceptionType.Punishment
              },
              {
                label: 'Response Message',
                value: ExceptionType.Response
              },
              {
                label: 'Resends',
                value: ExceptionType.Resend
              }
            ]
          }
      </Selector>
    </InlineOptionGroup>
    <Icon cursor="pointer" fontSize={20} as={FaTrash} onClick={() => {
      onDelete?.()
    }} />
  </HStack>
}
