import { TagData } from '@yaireo/tagify'
import Tags from '@yaireo/tagify/dist/react.tagify'

import React from 'react'

interface TagifyProps extends Tags.TagifyBaseReactProps {
  onChange: (value: any) => void
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

export function Tagify ({ onChange, value, ...props }: TagifyProps) {
  const [values, setValues] = React.useState([] as string[])

  React.useEffect(() => {
    setValues(generateProper(value, props.settings))
  }, [value])

  return (
    <Tags onChange={(val) => {
      onChange(val.detail.tagify.value
        .reduce<string[]>((a, b) => a.concat([b.id || b.value]), []))
    }} value={values} {...props} />
  )
}
