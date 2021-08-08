import { useGuild } from 'hooks/useGuilds'
import { IOption, ISetting, OptionType } from './settings'

import { Section } from '@jpbbots/censorbot-components'

import { Option as CCOption } from '~/functional/Option'

import { Tagify } from './Tagify'
import { updateObject } from 'utils/updateObject'
import type { FieldHelperProps } from 'formik'

import { Button, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputStepper, Select, Textarea } from '@chakra-ui/react'
import Pieces from 'utils/Pieces'
import { GuildData } from 'typings'
import { useEffect, useState } from 'react'

export function Option ({ helper, guild, pieces, disable, option }: {
  option: IOption
  helper: FieldHelperProps<any>
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
        helper.setValue(target.checked)
      }}
      isPremium={option.premium} />
  }

  if (option.type === OptionType.Input) {
    const Component = option.textarea ? Textarea : Input
    return <Component {...props} value={value ?? (option.default ?? '')} placeholder="None" onChange={({ target }: { target: HTMLInputElement|HTMLTextAreaElement }) => {
      if (!option.noneDisable && target.value === '') return disable()

      helper.setValue(target.value === '' ? null : target.value)
    }} />
  }

  if (option.type === OptionType.Select) {
    return <Select {...props} onChange={({ target }) => {
      helper.setValue(target.value === 'none' && option.allowNone
        ? null
        : option.number
          ? Number(target.value)
          : target.value
      )
    }} value={value ?? 'none'}>
      {option.allowNone && <option value="none">None</option>}
      {option.options(guild).map(opt =>
        <option key={opt.value} value={opt.value}>{opt.name}</option>
      )}
    </Select>
  }

  if (option.type === OptionType.Tagify) {
    const settings = option.settings(guild)
    return <Tagify {...props} settings={{
      ...settings,
      dropdown: settings.whitelist
        ? {
            enabled: 0,
            maxItems: settings.whitelist.length
          }
        : { enabled: false }
    }} placeholder={option.placeholder}
       helper={helper}
       value={value} />
  }

  if (option.type === OptionType.Number) {
    const multiplier = option.multiplier ?? 1

    return <NumberInput>
      <Input {...props} type="number" value={value / multiplier} onChange={({ target }) => {
        helper.setValue(Number(target.value) * multiplier)
      }} />
      <NumberInputStepper>
        <NumberIncrementStepper onClick={() => {
          helper.setValue(Number(value) + multiplier)
        }} />
        <NumberDecrementStepper onClick={() => {
          helper.setValue(Number(value) - multiplier)
        }} />
      </NumberInputStepper>
    </NumberInput>
  }

  if (option.type === OptionType.BitBool) {
    console.log(option)
    return <CCOption onChange={({ target }) => {
      console.log(value, target.checked, option)
      if (target.checked) {
        helper.setValue(value | option.bit)
      } else {
        helper.setValue(value & ~option.bit)
      }
    }} {...props}
      name={`${option.name}.${option.bit}`}
      isChecked={(value & option.bit) !== 0}
      label={option.label} />
  }

  return <h1>Error</h1>
}

export function Setting (setting: ISetting) {
  const [guild] = useGuild()
  const [value, setValue] = useState(guild?.db)

  useEffect(() => {
    setValue(guild?.db)
  }, [guild])

  const createHelper = (thing: string) => {
    return {
      setValue: (a: any) => {
        console.log(thing, a)
        const obj: any = {}
        obj[thing] = a
        setValue(updateObject(value, Pieces.normalize(obj)))
      }
    }
  }

  if (!guild) return null

  const pieces = Pieces.generate(value)

  const disabled = setting.disable && pieces[setting.disable.property] === setting.disable.disableValue

  return (
    <Section title={setting.title} description={setting.description}>
      {!disabled && setting.options.map((opt, i) =>
        <Option key={i}
          option={opt}
          helper={createHelper(opt.name)}
          guild={guild}
          pieces={pieces}
          disable={() => {
            if (!setting.disable) return
            createHelper(setting.disable.property).setValue(setting.disable?.enableValue)
          }} />
      )}
      {
        setting.disable &&
        (
          disabled
            ? <Button
              onClick={() => {
                if (!setting.disable) return
                createHelper(setting.disable.property).setValue(setting.disable?.enableValue)
              }}
            >{setting.disable.enableButton ?? 'Enable'}</Button>
            : <Button
            onClick={() => {
              if (!setting.disable) return
              createHelper(setting.disable.property).setValue(setting.disable?.disableValue)
            }}>{setting.disable.disableButton ?? 'Disable'}</Button>
        )
      }
    </Section>
  )
}
