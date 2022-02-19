import { Input } from '@chakra-ui/input'
import { Flex } from '@chakra-ui/layout'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  HStack,
  Text
} from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa'
import { Tag } from '@jpbbots/censorbot-components'

import { useRef, useState } from 'react'
import { uDW, wLT } from '@/hooks/useScreenSize'

export interface ITag {
  id?: string
  value: string
  color?: number
}

export interface TagsSettings {
  whitelist?: ITag[]
  maxLength?: number
  maxTags?: number
  maxMessage?: string
  allowSpaces?: boolean
  role?: boolean
  channel?: boolean
}

export interface TagsProps {
  value: string[]
  settings: TagsSettings
  placeholder: string
  onChange?: (value: string[]) => void
}

export const Tags = ({ value, settings, onChange, placeholder }: TagsProps) => {
  const { whitelist } = settings
  const [focusing, setFocusing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputFlip = wLT(390)

  const inputProps: any = {
    bg: 'transparent !important',
    border: 'none !important',

    onFocus: () => {
      setFocusing(true)
    }
  }

  const remove = (val: string) => {
    let removing: string
    if (whitelist) {
      const inWhitelist = whitelist.find((x) => x.id === val)?.id
      if (!inWhitelist) return

      removing = inWhitelist
    } else {
      removing = val
    }

    onChange?.(value.filter((x) => x !== removing))
  }

  const add = (val: string) => {
    if (settings.maxTags && value.length + 1 > settings.maxTags) return

    onChange?.([...value, val])
  }

  return (
    <Flex
      wrap="wrap"
      align="left"
      bg="lighter.5"
      borderRadius="md"
      _hover={{
        bg: 'lighter.10'
      }}
      w="fit-content"
      border="2px solid"
      borderColor={focusing ? 'brand.100' : 'transparent'}
      p="10px"
      onClick={() => inputRef.current?.focus()}
    >
      <Flex wrap="wrap" gridGap={2} bg="transparent" alignContent="center">
        {value.map((tagValue) => {
          const val = whitelist
            ? whitelist.find((x) => x.id === tagValue) ?? { value: tagValue }
            : { value: tagValue }

          return (
            <Tag
              h="39px"
              key={val.value}
              label={val.value}
              color={val.color ? String(val.color) : undefined}
              _hover={{
                bg: 'brand.20'
              }}
              isRole={settings.role}
              isChannel={settings.channel}
              onDelete={() => remove(tagValue)}
            />
          )
        })}
      </Flex>
      {whitelist ? (
        <Menu
          gutter={16}
          onOpen={() => {
            setFocusing(true)
          }}
          onClose={() => {
            setFocusing(false)
          }}
        >
          <MenuButton
            px="16px"
            disabled={!!settings.maxTags && value.length >= settings.maxTags}
          >
            <HStack spacing="8px">
              <Icon as={FaPlus} />
              <Text>{placeholder}</Text>
            </HStack>
          </MenuButton>
          <MenuList
            maxH={uDW({ mobile: '200px', tablet: '400px' })}
            overflowY="scroll"
            p="2px"
          >
            {whitelist
              .filter((a) => !value.some((x) => x === a.id))
              .map((tag) => (
                <MenuItem
                  key={tag.id}
                  onClick={() => {
                    add(tag.id!)
                  }}
                >
                  {settings.channel ? '#' : settings.role ? '@' : ''}
                  {tag.value}
                </MenuItem>
              ))}
          </MenuList>
        </Menu>
      ) : (
        <Input
          disabled={settings.maxTags ? value.length >= settings.maxTags : false}
          placeholder={
            settings.maxMessage &&
            settings.maxTags &&
            value.length >= settings.maxTags
              ? settings.maxMessage
              : placeholder
          }
          w={
            settings.maxTags && settings.maxMessage
              ? value.length >= settings.maxTags
                ? `${settings.maxMessage.length}em`
                : 'fit-content'
              : 'fit-content'
          }
          h="39px"
          maxLength={settings.maxLength}
          {...inputProps}
          onKeyDown={(ev) => {
            if (ev.key === 'Backspace' && !ev.currentTarget.value) {
              return remove(value[value.length - 1])
            }

            if (
              ['Enter', 'Tab'].includes(ev.key) ||
              (!settings.allowSpaces && ev.key === ' ')
            ) {
              let val = ev.currentTarget.value
              while (val.endsWith(' ')) {
                val = val.slice(0, -1)
              }

              if (value.includes(val) || val === '') {
                ev.currentTarget.value = ''
                return
              }

              add(val)
              ev.currentTarget.value = ''
            }
          }}
          onBlur={({ target }) => {
            if (target.value) {
              target.value = ''
            }
            setFocusing(false)
          }}
          onChange={({ target }) => {
            if (target.value === ' ') target.value = ''
          }}
          ref={inputRef}
          maxW={inputFlip ? '50vw' : '80vw'}
        />
      )}
    </Flex>
  )
}
