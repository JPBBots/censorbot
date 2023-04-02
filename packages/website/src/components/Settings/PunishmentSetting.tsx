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
import { GuildData, PunishmentLevel, PunishmentType } from '@censorbot/typings'
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

const MONTH_TIME = 2419000000
const BASE_TIMES = [60e3, 300000, 600000, 3.6e6, 8.64e7, 6.048e8, MONTH_TIME]

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
                  const punishmentType = Number(type)
                  if (punishment.type === punishmentType) return

                  const newTime =
                    punishmentType === PunishmentType.Timeout ? 60e3 : null

                  const newObject: Partial<PunishmentLevel> = {
                    type: punishmentType,
                    time:
                      'time' in punishment &&
                      (!!punishment.time ||
                        (punishmentType === PunishmentType.Timeout &&
                          punishment.time !== null))
                        ? (punishment.time ?? 0) > MONTH_TIME
                          ? MONTH_TIME
                          : punishment.time
                        : newTime
                  }

                  if (newObject.type === PunishmentType.GiveRole && !newObject.role)
                    newObject.role = guild.guild.roles[0].id

                  setValue(newObject)
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
                setValue({ time: val as any })
              }}
              max={
                punishment.type === PunishmentType.Timeout
                  ? MONTH_TIME
                  : 5259600000
              }
              times={
                punishment.type === PunishmentType.Timeout
                  ? BASE_TIMES
                  : BASE_TIMES.concat(5259600000)
              }
              nullIs={
                punishment.type === PunishmentType.Timeout
                  ? undefined
                  : 'Forever'
              }
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
