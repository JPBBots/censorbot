import { useEffect, useState } from 'react'

import { Menu, MenuList, MenuItem, MenuButton } from '@chakra-ui/menu'
import { VStack, Wrap } from '@chakra-ui/layout'
import { Icon } from '@chakra-ui/icon'
import { Input } from '@chakra-ui/input'
import { Tooltip } from '@chakra-ui/tooltip'
import { FaChevronDown } from 'react-icons/fa'

import humanize from 'humanize-duration'

const TIME_CONV: Record<number, string> = {
  2419000000: '1 month',
  5259600000: '2 months'
}

export interface TimeSelectorOptions {
  value: number | null
  times: Array<string | number>
  onChange: (value: number | null | false) => void
  nullIs?: string
  nullIsFalse?: boolean
  max?: number
}

export function TimeSelector(opts: TimeSelectorOptions) {
  const [editing, setEditing] = useState(false)

  const [maluableValue, setMaluableValue] = useState<number | null>(0)
  useEffect(() => {
    setMaluableValue(opts.value)
  }, [opts.value])

  const times = [...opts.times]

  if (opts.nullIs) {
    times.unshift(opts.nullIs)
  }

  return (
    <Wrap gridGap={4}>
      <VStack spacing={0}>
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
                : opts.nullIs &&
                  opts.value === (opts.nullIsFalse ? false : null)
                ? opts.nullIs
                : opts.value && TIME_CONV[opts.value]
                ? TIME_CONV[opts.value]
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
                  opts.onChange(opts.nullIsFalse ? false : null)
                } else opts.onChange(time as number)
              }}
            >
              {typeof time === 'number'
                ? TIME_CONV[time]
                  ? TIME_CONV[time]
                  : humanize(time, { largest: 1 })
                : time}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Wrap>
  )
}
