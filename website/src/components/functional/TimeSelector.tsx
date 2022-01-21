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
  max?: number
  onChange: (value: number) => void
  value: number
}

const MONTH_TIME = 2629800000

export function TimeSelector({ max, onChange, value }: TimeSelectorOptions) {
  const [editing, setEditing] = useState(false)

  const [maluableValue, setMaluableValue] = useState(0)
  useEffect(() => {
    setMaluableValue(value)
  }, [value])

  return (
    <Wrap gridGap={4}>
      <VStack s={0}>
        <Tooltip isOpen={editing} label="Time in seconds">
          <Input
            value={
              editing
                ? Math.floor(maluableValue / 1000)
                : humanize(value, { largest: 2 })
            }
            w="230px"
            h="20px"
            onChange={({ target }) => {
              if (isNaN(Number(target.value))) return

              if (max && Number(target.value) * 1000 > max)
                setMaluableValue(max)
              else setMaluableValue(Number(target.value) * 1000)
            }}
            onFocus={() => setEditing(true)}
            onBlur={() => {
              onChange(maluableValue)
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
          {[
            60e3,
            300000,
            600000,
            3.6e6,
            8.64e7,
            6.048e8,
            MONTH_TIME,
            max! > MONTH_TIME ? MONTH_TIME * 2 : undefined
          ].map((time) =>
            time ? (
              <MenuItem
                key={time}
                onClick={() => {
                  onChange(time)
                }}
              >
                {humanize(time, { largest: 1 })}
              </MenuItem>
            ) : (
              ''
            )
          )}
        </MenuList>
      </Menu>
    </Wrap>
  )
}
