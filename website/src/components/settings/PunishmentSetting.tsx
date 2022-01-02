import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  Wrap,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  NumberInputField,
  Icon,
  Button,
  HStack
} from '@chakra-ui/react'
import { GuildData, PunishmentLevel, PunishmentType } from 'typings/api'
import { TimeSelector } from '~/functional/TimeSelector'

import { FaTrash } from 'react-icons/fa'

export interface PunishmentSettingProps {
  punishment: PunishmentLevel
  guild: GuildData
  onChange?: (data: PunishmentLevel) => void
  onDelete?: () => void
}

const punishmentLevels = {
  [PunishmentType.GiveRole]: 'given a role',
  [PunishmentType.Ban]: 'banned',
  [PunishmentType.Kick]: 'kicked',
  [PunishmentType.Timeout]: 'timed out'
}

export function PunishmentSetting({
  punishment,
  guild,
  onChange,
  onDelete
}: PunishmentSettingProps) {
  const setValue = (val: Partial<PunishmentLevel>) => {
    onChange?.({ ...punishment, ...val } as any)
  }

  return (
    <HStack bg="lighter.5" w="full" borderRadius="md" p={2} px={4}>
      <Wrap w="full" align="center">
        After
        <NumberInput
          w="100px"
          value={punishment.amount}
          onChange={(_, amount) => {
            setValue({ amount })
          }}
          max={20}
          size="sm"
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        warnings. The user will be
        <Menu gutter={16}>
          <MenuButton>
            <Button p={2} borderRadius="md">
              {punishmentLevels[punishment.type]}
            </Button>
          </MenuButton>
          <MenuList>
            {(
              Object.keys(punishmentLevels) as unknown as Array<0 | 1 | 2 | 3>
            ).map((type) => (
              <MenuItem
                key={type}
                onClick={() => {
                  setValue({ type: Number(type) })
                }}
              >
                {punishmentLevels[type]}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        {punishment.type === PunishmentType.GiveRole && (
          <Select
            size="sm"
            onChange={({ target }) => setValue({ role: target.value })}
            value={punishment.role ?? 'none'}
            w="fit-content"
          >
            {guild?.guild.roles.map((x) => (
              <option key={x.id} value={x.id}>
                @{x.name}
              </option>
            ))}
          </Select>
        )}
        {(punishment.type === PunishmentType.Ban ||
          punishment.type === PunishmentType.GiveRole ||
          punishment.type === PunishmentType.Timeout) && (
          <>
            for
            <TimeSelector
              onChange={(val) => {
                setValue({ time: val })
              }}
              max={2419200000}
              value={punishment.time}
            />
          </>
        )}
      </Wrap>

      <Icon
        cursor="pointer"
        fontSize={20}
        alignSelf="center"
        as={FaTrash}
        onClick={() => {
          onDelete?.()
        }}
      />
    </HStack>
  )
}