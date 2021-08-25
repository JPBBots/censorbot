import { Input } from '@chakra-ui/input'
import { HStack, VStack } from '@chakra-ui/layout'
import { Select } from '@chakra-ui/select'
import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/tag'

import { FaTimes } from 'react-icons/fa'

export interface ITag {
  id?: string
  value: string
}

export interface TagsSettings {
  whitelist?: ITag[]
  maxLength?: number
  maxTags?: number
  maxMessage?: string
  allowSpaces?: boolean
}

export interface TagsProps {
  value: string[]
  settings: TagsSettings
  placeholder: string
  onChange?: (value: string[]) => void
}

export const Tags = ({ value, settings, onChange, placeholder }: TagsProps) => {
  const { whitelist } = settings

  const remove = (val: string) => {
    let removing: string
    if (whitelist) {
      const inWhitelist = whitelist.find(x => x.id === val)?.id
      if (!inWhitelist) return

      removing = inWhitelist
    } else {
      removing = val
    }

    onChange?.(value.filter(x => x !== removing))
  }

  const add = (val: string) => {
    onChange?.([...value, val])
  }

  return (
    <VStack align="left">
      <HStack wrap="wrap">
        {
          value.map(tagValue => {
            const val = whitelist
              ? whitelist.find(x => x.id === tagValue)?.value
              : tagValue

            return (
              <Tag size="sm">
                <TagLeftIcon
                  boxSize="12px"
                  cursor="pointer"
                  as={FaTimes}
                  onClick={() => {
                    remove(tagValue)
                  }}/>
                <TagLabel>{val}</TagLabel>
              </Tag>
            )
          })
        }
      </HStack>
      {
        whitelist
          ? <Select w="400px" onChange={({ target }) => {
            if (target.value === '_') return

            const val = whitelist.find(x => x.id === target.value)

            if (val?.id) {
              if (value.includes(val.id)) {
                target.value = '_'

                return
              }
              add(val.id)

              target.value = '_'
            }
          }}>
            <option value="_">{placeholder}</option>
            {
              whitelist.filter(a => !value.some(b => a.id === b)).map(x => <option value={x.id}>{x.value}</option>)
            }
          </Select>
          : <Input
              disabled={settings.maxTags ? (value.length >= settings.maxTags) : false}
              placeholder={
                settings.maxMessage && settings.maxTags && value.length >= settings.maxTags
                  ? settings.maxMessage
                  : placeholder
              }
              w="400px"
              maxLength={settings.maxLength}
              onKeyDown={(ev) => {
                if (ev.key === 'Backspace' && !ev.currentTarget.value) {
                  return remove(value[value.length - 1])
                }

                if (['Enter', 'Tab'].includes(ev.key) || (!settings.allowSpaces && ev.key === ' ')) {
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
              }} onChange={({ target }) => {
                if (target.value === ' ') target.value = ''
              }} />
      }
    </VStack>
  )
}
