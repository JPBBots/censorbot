import {
  Flex,
  Input,
  Text,
  VStack,
  Tooltip,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Icon,
  Wrap
} from '@chakra-ui/react'
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from '@chakra-ui/slider'
import { useEffect, useState } from 'react'

import humanize from 'humanize-duration'
import { FaChevronDown } from 'react-icons/fa'

export interface TimeSelectorOptions {
  max?: number
  onChange: (value: number) => void
  value: number
}

export function TimeSelector({ max, onChange, value }: TimeSelectorOptions) {
  const [editing, setEditing] = useState(false)

  const [maluableValue, setMaluableValue] = useState(0)
  useEffect(() => {
    setMaluableValue(value)
  }, [value])

  return (
    <Wrap p={4} gridGap={4}>
      <VStack s={0}>
        <Slider
          max={max}
          value={value}
          w="205px"
          onChange={(newValue) => {
            onChange(newValue)
          }}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>

          <SliderThumb />
        </Slider>
        <Text userSelect="none" margin="0px !important">
          {humanize(maluableValue, { largest: 3 })}
        </Text>
      </VStack>
      <Tooltip isOpen={editing} label="Time in seconds">
        <Input
          value={
            editing
              ? Math.floor(maluableValue / 1000)
              : humanize(value, { largest: 1 })
          }
          w="150px"
          h="50px"
          onChange={({ target }) => {
            setMaluableValue(Number(target.value) * 1000)
          }}
          onFocus={() => setEditing(true)}
          onBlur={() => {
            onChange(maluableValue)
            setEditing(false)
          }}
        />
      </Tooltip>
      <Menu gutter={16}>
        <MenuButton>
          <Icon as={FaChevronDown} />
        </MenuButton>
        <MenuList>
          {[60e3, 300000, 600000, 3.6e6, 8.64e7, 6.048e8, max!].map((time) => (
            <MenuItem
              key={time}
              onClick={() => {
                onChange(time)
              }}
            >
              {humanize(time)}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Wrap>
  )
}
