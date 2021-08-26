import { GuildData, Exception, ExceptionType } from '@/../../typings/api'
import { DeepPartial, HStack, VStack, Select, Text, Icon } from '@chakra-ui/react'
import React from 'react'
import { FaTrash } from 'react-icons/fa'

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

  return (
    <HStack spacing={4} justify="center">
      <VStack>
        {first && <Text textStyle="heading.sm">Role</Text>}
        <Select
          w="200px"
          value={exception.role ?? '_'}
          onChange={({ target }) => change({ role: target.value === '_' ? null : target.value })}>
          <option value='_'>All Roles</option>
          {
            guild.guild.r.map(x => <option key={x.id} value={x.id}>@{x.name}</option>)
          }
        </Select>
      </VStack>
      <VStack>
        {first && <Text textStyle="heading.sm">Channel</Text>}
        <Select
          w="200px"
          value={exception.channel ?? '_'}
          onChange={({ target }) => change({ channel: target.value === '_' ? null : target.value })}>
          <option value="_">All Channels</option>
          {
            guild.guild.c.map(x => <option key={x.id} value={x.id}>#{x.name}</option>)
          }
        </Select>
      </VStack>
      <VStack>
        {first && <Text textStyle="heading.sm">Bypasses</Text>}
        <Select
          w="200px"
          value={exception.type}
          onChange={({ target }) => change({ type: Number(target.value) })}>
          <option value={ExceptionType.Censor}>Curses</option>
          <option value={ExceptionType.Punishment}>Punishments</option>
          <option value={ExceptionType.Response}>Response Messages</option>
          <option value={ExceptionType.Resend}>Resends</option>
        </Select>
      </VStack>
      <Icon cursor="pointer" fontSize={20} as={FaTrash} onClick={() => {
        onDelete?.()
      }} />
    </HStack>
  )
}
