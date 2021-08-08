import { TagData } from '@yaireo/tagify'
import Tags from '@yaireo/tagify/dist/react.tagify'
import { FieldHelperProps } from 'formik'

import React from 'react'

export interface TagifyProps extends Tags.TagifyBaseReactProps {
  onChange?: (value: any) => void
  helper?: FieldHelperProps<any>
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

export function Tagify ({ onChange, helper, value, ...props }: TagifyProps) {
  const [values, setValues] = React.useState([] as string[])

  React.useEffect(() => {
    if (value) setValues(generateProper(value, props.settings))
  }, [value])

  console.log(props.settings)

  return (
    <Tags onChange={(val) => {
      const newVal = val.detail.tagify.value
        .reduce<string[]>((a, b) => a.concat([b.id || b.value]), [])

      console.log(newVal)

      helper ? helper.setValue(newVal) : onChange?.(newVal)
    }} value={values} {...props} />
  )
}
