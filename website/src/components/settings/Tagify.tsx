import { TagData } from '@yaireo/tagify'
import Tags from '@yaireo/tagify/dist/react.tagify'
import { FieldHelperProps } from 'formik'

import React from 'react'

interface TagifyProps extends Tags.TagifyBaseReactProps {
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
  const [first, setFirst] = React.useState(true)

  React.useEffect(() => {
    if (value) setValues(generateProper(value, props.settings))

    setFirst(false)
  }, [value])

  return (
    <Tags onChange={(val) => {
      if (first) return setFirst(false)
      console.log({ posting: props.placeholder })
      const newVal = val.detail.tagify.value
        .reduce<string[]>((a, b) => a.concat([b.id || b.value]), [])

      helper ? helper.setValue(newVal) : onChange?.(newVal)
    }} value={values} {...props} />
  )
}
