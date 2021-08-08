import { useGuild } from 'hooks/useGuilds'
import { IOption, ISetting, OptionType } from './settings'

import { Option as CCOption, Section } from '@jpbbots/censorbot-components'
import { Tagify } from './Tagify'
import { updateObject } from 'utils/updateObject'
import type { FieldHelperProps } from 'formik'

import { Input, Select } from '@chakra-ui/react'
import Pieces from 'utils/Pieces'

export function Option ({ helper, ...option }: IOption & {
  helper: FieldHelperProps<any>
}) {
  const [guild] = useGuild()
  if (!guild) return <h1>Loading</h1>

  let props = { name: option.name }

  if (option.props) {
    props = updateObject(props, option.props)
  }
  if (option.premiumProps && guild.premium) {
    props = updateObject(props, option.premiumProps)
  }

  const value = Pieces.generate(guild.db)[option.name]

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
    return <Input {...props} value={value ?? ''} placeholder="None" onChange={({ target }) => {
      if (!option.allowNone && target.value === '') return

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
  return <Section title={setting.title} description={setting.description}>
    {setting.options.map((opt, i) =>
      <Option key={i} {...opt} helper={{
        setValue: (a) => console.log(a)
      }} />
    )}
  </Section>
}
