import { useGuild } from '@/hooks/useGuilds'
import { IOption, ISetting, OptionType, settings } from './settings'

import { Section } from '@jpbbots/censorbot-components'

import { Option as CCOption } from '~/functional/Option'

import { updateObject } from '@/utils/updateObject'

import { Button, Icon, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputStepper, Select, Textarea } from '@chakra-ui/react'
import Pieces from 'utils/Pieces'
import { GuildData } from 'typings'
import { SectionName } from './Sidebar'

import TextareaResizer from 'react-textarea-autosize'
import { Tags } from './Tags'

export function Option ({ setValue, guild, pieces, disable, option }: {
  option: IOption
  setValue: (value: any) => void
  guild: GuildData
  disable: () => void
  pieces: any
}) {
  if (!guild) return <h1>Loading</h1>

  let props = { name: option.name }

  if (option.props) {
    props = updateObject(props, option.props)
  }
  if (option.premiumProps && guild.premium) {
    props = updateObject(props, option.premiumProps)
  }

  const value = pieces[option.name]

  if (option.type === OptionType.Boolean) {
    return <CCOption {...props}
      isChecked={value}
      label={option.label}
      onChange={({ target }) => {
        setValue(target.checked)
      }}
      isPremium={option.premium} />
  }

  if (option.type === OptionType.Input) {
    const Component = option.textarea ? Textarea : Input
    return <Component {...props}
      as={option.textarea ? TextareaResizer : undefined}
      resize="none"
      value={value ?? (option.default ?? '')}
      placeholder="None"
      onChange={({ target }: { target: HTMLInputElement|HTMLTextAreaElement }) => {
        if (!option.noneDisable && target.value === '') return disable()

        setValue(target.value === '' ? null : target.value)
      }} />
  }

  if (option.type === OptionType.Select) {
    return <Select
      {...props}
      onChange={({ target }) => {
        setValue(target.value === 'none' && option.allowNone
          ? null
          : option.number
            ? Number(target.value)
            : target.value
        )
      }}
      value={value ?? 'none'}>
      {option.allowNone && <option value="none">None</option>}
      {option.options(guild).map(opt =>
        <option key={opt.value} value={opt.value}>{opt.name}</option>
      )}
    </Select>
  }

  if (option.type === OptionType.Tags) {
    return <Tags {...props} settings={option.settings(guild)} placeholder={option.placeholder} value={value} onChange={(val) => {
      setValue(val)
    }} />
  }

  if (option.type === OptionType.Number) {
    const multiplier = option.multiplier ?? 1

    return <NumberInput>
      <Input {...props} type="number" value={value / multiplier} onChange={({ target }) => {
        setValue(Number(target.value) * multiplier)
      }} />
      <NumberInputStepper>
        <NumberIncrementStepper onClick={() => {
          setValue(Number(value) + multiplier)
        }} />
        <NumberDecrementStepper onClick={() => {
          setValue(Number(value) - multiplier)
        }} />
      </NumberInputStepper>
    </NumberInput>
  }

  if (option.type === OptionType.BitBool) {
    return <CCOption onChange={({ target }) => {
      console.log(value, target.checked, option)
      if (target.checked) {
        setValue(value | option.bit)
      } else {
        setValue(value & ~option.bit)
      }
    }} {...props}
      name={`${option.name}.${option.bit}`}
      isChecked={(value & option.bit) !== 0}
      label={option.label} />
  }

  return <h1>Error</h1>
}

export function Setting (setting: ISetting) {
  const [guild, volatileDb, setValue] = useGuild()

  if (!guild) return null

  const pieces = Pieces.generate(volatileDb)

  const disabled = setting.disable && pieces[setting.disable.property] === setting.disable.disableValue

  return (
    <Section
      title={setting.title}
      description={setting.description}
      isPremium={setting.premium}
      icon={setting.icon && <Icon as={setting.icon} />}
      >
      {!disabled && setting.options.map((opt, i) =>
        <Option key={i}
          option={opt}
          setValue={(value) => {
            setValue(opt.name, value)
          }}
          guild={guild}
          pieces={pieces}
          disable={() => {
            if (!setting.disable) return
            setValue(setting.disable.property, setting.disable.enableValue)
          }} />
      )}
      {
        setting.disable &&
        (
          disabled
            ? <Button
              onClick={() => {
                if (!setting.disable) return
                setValue(setting.disable.property, setting.disable.enableValue)
              }}
            >{setting.disable.enableButton ?? 'Enable'}</Button>
            : <Button
            onClick={() => {
              if (!setting.disable) return
              setValue(setting.disable.property, setting.disable.disableValue)
            }}>{setting.disable.disableButton ?? 'Disable'}</Button>
        )
      }
    </Section>
  )
}

export const sectionSettings = (section: SectionName) => {
  const selected = settings.filter(x => x.section === section)

  return <>
      {selected.map(x => <Setting key={x.title ?? x.options[0].name} {...x} />)}
    </>
}
