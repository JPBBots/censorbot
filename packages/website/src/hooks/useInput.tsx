import { useState } from 'react'

import { Select, SelectProps } from '@chakra-ui/select'
import { Input, InputProps } from '@chakra-ui/input'

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
