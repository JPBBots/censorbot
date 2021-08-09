import { TagData } from '@yaireo/tagify'
import Tags from '@yaireo/tagify/dist/react.tagify'

import React from 'react'

export interface TagifyProps extends Tags.TagifyBaseReactProps {
  onChange?: (value: any) => void
  value: string[]
}

function generateProper (value: TagifyProps['value'], settings: TagifyProps['settings']) {
  const val: any[] = []

  if (settings?.whitelist && settings.whitelist.length > 0) {
    (settings.whitelist as TagData[]).filter(x => value.includes(x.id)).forEach(x => val.push(x.value))
  } else {
    value.forEach(x => val.push(x))
  }

  return val
}

export function Tagify ({ onChange, value, ..._props }: TagifyProps) {
  const [values, setValues] = React.useState(value)

  const { settings: _tagSettings, ...props } = _props
  const { whitelist, ...tagSettings } = _tagSettings ?? {}

  React.useEffect(() => {
    if (value) setValues(generateProper(value, _tagSettings))
  }, [value])

  return (
    <Tags onChange={(val) => {
      const newVal = val.detail.tagify.value
        .reduce<string[]>((a, b) => a.concat([b.id || b.value]), [])

      if (([...newVal]).sort().join(',') === ([...values]).sort().join(',')) return console.log('locked')

      console.log(newVal)

      onChange?.(newVal)
    }} whitelist={whitelist} settings={tagSettings} value={values} {...props} />
  )
}
