import { Input, InputProps, Select, SelectProps } from '@chakra-ui/react'
import { useState } from 'react'

export const useInput = <V extends string | number = string>() => {
  const [value, setValue] = useState<V>()

  return {
    Input: (props: InputProps) => {
      return (
        <Input
          {...props}
          value={value}
          onChange={(ev: any) => {
            setValue(ev.target.value)
          }}
        />
      )
    },
    value
  }
}

export const useSelect = <V extends string | number = string>() => {
  const [value, setValue] = useState<V>()

  return {
    Select: (props: SelectProps) => {
      return (
        <Select
          {...props}
          value={value}
          onChange={(ev: any) => {
            setValue(ev.target.value)
          }}
        />
      )
    },
    value
  }
}
