import {
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputStepper,
  Wrap,
  Select
} from '@chakra-ui/react'
import { GuildData, PunishmentLevel, PunishmentType } from 'typings/api'
import { TimeSelector } from '~/functional/TimeSelector'

export interface PunishmentSettingProps {
  punishment: PunishmentLevel
  guild: GuildData
  onChange?: (data: PunishmentLevel) => void
}

export function PunishmentSetting({
  punishment,
  guild,
  onChange
}: PunishmentSettingProps) {
  const setValue = (val: Partial<PunishmentLevel>) => {
    onChange?.({ ...punishment, ...val } as any)
  }

  return (
    <Wrap bg="lighter.5" borderRadius="md" align="center" p={5}>
      After
      <NumberInput w="100px">
        <Input
          type="number"
          value={punishment.amount}
          onChange={({ target }) => {
            setValue({ amount: Number(target.value) })
          }}
        />
        <NumberInputStepper>
          <NumberIncrementStepper
            onClick={() => {
              setValue({ amount: punishment.amount + 1 })
            }}
          />
          <NumberDecrementStepper
            onClick={() => {
              setValue({ amount: punishment.amount - 1 })
            }}
          />
        </NumberInputStepper>
      </NumberInput>
      warnings. The user will be
      <Select
        w="180px"
        value={punishment.type}
        onChange={({ target }) => {
          setValue({ type: Number(target.value) })
        }}
      >
        <option value={PunishmentType.Ban}>banned</option>
        <option value={PunishmentType.GiveRole}>given a role</option>
        <option value={PunishmentType.Kick}>kicked</option>
        <option value={PunishmentType.Timeout}>timed out</option>
      </Select>
      {punishment.type === PunishmentType.GiveRole && (
        <Select
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
          and it will be undone in
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
  )
}
