import { Input } from '@chakra-ui/input'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Icon,
  HStack,
  Text,
  Flex
} from '@chakra-ui/react'
import { FaEllipsisV, FaPlus } from 'react-icons/fa'
import { Tag } from '@jpbbots/censorbot-components'

import { useRef, useState } from 'react'
import { wLT } from '@jpbbots/theme'

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
  allowCopy?: boolean
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
  const [clearing, setClearing] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

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
      removing = whitelist.find((x) => x.id === val)?.id ?? val
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
      px={value.length ? undefined : '0px'}
      onClick={() => {
        if (!menuRef.current?.matches(':hover')) {
          inputRef.current?.focus()
        }
      }}
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
              maxH={{ mobile: '200px', tablet: '400px' }}
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
            disabled={
              settings.maxTags ? value.length >= settings.maxTags : false
            }
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
      {settings.allowCopy && (
        <Flex ref={menuRef}>
          <Menu
            onClose={() => {
              setClearing(false)
            }}
            gutter={16}
          >
            <MenuButton mr="7px">
              <Icon aria-label="Copy and paste words" as={FaEllipsisV} />
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={() => {
                  navigator.clipboard.writeText(`${value.join(';')}`)
                }}
              >
                Copy
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  const text = await navigator.clipboard
                    .readText()
                    .catch(() => null)

                  if (!text) return

                  onChange?.([...value, ...text.split(';')])
                }}
              >
                Paste
              </MenuItem>
              <MenuItem
                onClick={() => {
                  if (!clearing) {
                    return setClearing(true)
                  }

                  onChange?.([])
                }}
                closeOnSelect={clearing}
                color={clearing ? 'brand.100' : undefined}
                _hover={{
                  color: 'brand.100'
                }}
              >
                {clearing ? 'Are you sure?' : 'Clear'}
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      )}
    </Flex>
  )
}
