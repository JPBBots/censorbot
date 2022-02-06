import {
  Input,
  VStack,
  Tooltip,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Icon,
  Wrap
} from '@chakra-ui/react'

import { useEffect, useState } from 'react'

import humanize from 'humanize-duration'
import { FaChevronDown } from 'react-icons/fa'

export interface TimeSelectorOptions {
  value: number | null
  onChange: (value: number | null) => void
  nullIs?: string
  max?: number
}

const MONTH_TIME = 2629800000

export function TimeSelector(opts: TimeSelectorOptions) {
  const [editing, setEditing] = useState(false)

  const [maluableValue, setMaluableValue] = useState<number | null>(0)
  useEffect(() => {
    setMaluableValue(opts.value)
  }, [opts.value])

  const times: Array<string | number> = [
    60e3,
    300000,
    600000,
    3.6e6,
    8.64e7,
    6.048e8,
    MONTH_TIME
  ]

  if (opts.max! > MONTH_TIME) {
    times.push(MONTH_TIME * 2)
  }

  if (opts.nullIs) {
    times.unshift(opts.nullIs)
  }

  return (
    <Wrap gridGap={4}>
      <VStack s={0}>
        <Tooltip
          isOpen={editing}
          label="Time in seconds"
          hasArrow
          bg="black"
          opacity={100}
          p={2}
          borderRadius="md"
        >
          <Input
            value={
              editing
                ? maluableValue === null
                  ? 0
                  : Math.floor(maluableValue / 1000)
                : opts.nullIs && opts.value === null
                ? opts.nullIs
                : humanize(opts.value ?? 0, { largest: 2 })
            }
            w="230px"
            h="20px"
            onChange={({ target }) => {
              if (isNaN(Number(target.value))) return

              if (opts.max && Number(target.value) * 1000 > opts.max)
                setMaluableValue(opts.max)
              else setMaluableValue(Number(target.value) * 1000)
            }}
            onFocus={() => setEditing(true)}
            onBlur={() => {
              opts.onChange(maluableValue as number)
              setEditing(false)
            }}
          />
        </Tooltip>
      </VStack>
      <Menu gutter={16}>
        <MenuButton>
          <Icon as={FaChevronDown} />
        </MenuButton>
        <MenuList>
          {times.map((time) => (
            <MenuItem
              key={time}
              onClick={() => {
                if (time === opts.nullIs) {
                  opts.onChange(null)
                } else opts.onChange(time as number)
              }}
            >
              {typeof time === 'number' ? humanize(time, { largest: 1 }) : time}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Wrap>
  )
}
