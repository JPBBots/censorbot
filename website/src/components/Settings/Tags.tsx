import { Input } from '@chakra-ui/input'
import { Flex } from '@chakra-ui/layout'
import { Select } from '@chakra-ui/select'
import { Tag } from '@jpbbots/censorbot-components'

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

  const inputProps: any = {
    _hover: {
      bg: 'transparent'
    },

    maxWidth: '80vw',
    bg: 'transparent'
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
      pl={value.length > 0 ? '10px' : '0px'}
    >
      <Flex
        wrap="wrap"
        gridGap={2}
        bg="transparent"
        alignContent="center"
        pr={value.length > 0 ? '10px' : '0px'}
      >
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
        <Select
          w="150px"
          onChange={({ target }) => {
            if (target.value === '_') return

            const val = whitelist.find((x) => x.id === target.value)

            if (val?.id) {
              if (!value.includes(val.id)) add(val.id)

              target.value = '_'
            }
          }}
          {...inputProps}
        >
          <option value="_">{placeholder}</option>
          {whitelist
            .filter((a) => !value.some((b) => a.id === b))
            .map((x) => (
              <option key={x.id} value={x.id}>
                {x.value}
              </option>
            ))}
        </Select>
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
          w="fit-content"
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
          }}
          onChange={({ target }) => {
            if (target.value === ' ') target.value = ''
          }}
        />
      )}
    </Flex>
  )
}
