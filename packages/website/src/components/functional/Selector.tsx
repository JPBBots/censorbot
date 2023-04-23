import { useState } from 'react'

import { SelectMenu } from './SelectMenu'
import { Tag } from './Tag'

import { Input } from '@chakra-ui/input'
import { Box } from '@chakra-ui/layout'
import { UseDisclosureReturn } from '@chakra-ui/hooks'

import FuzzySearch from 'fuzzy-search'

export interface SelectorTagOptions {
  value: any
  label: string
  color?: number
}

export interface SelectorProps {
  value: any
  onChange: (val: any) => void
  children: SelectorTagOptions[]
  role?: boolean
  channel?: boolean
  placeholder: string
}

export interface SelectorTagProps {
  tag: SelectorTagOptions
  role?: boolean
  channel?: boolean
  onClick: () => void
}

export const SelectorTag = ({
  tag,
  role,
  channel,
  onClick
}: SelectorTagProps) => {
  return (
    <Tag
      w="full"
      justifyContent="start"
      label={tag.label}
      color={'#' + String(tag.color?.toString(16))}
      isRole={tag.value !== 'none' ? role : false}
      isChannel={tag.value !== 'none' ? channel : false}
      bg="transparent"
      onClick={onClick}
    />
  )
}

export const Selector = ({
  value,
  onChange,
  children,
  role,
  channel,
  placeholder
}: SelectorProps) => {
  const [search, setSearch] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)

  let menuDisclosure: UseDisclosureReturn

  const searcher = new FuzzySearch(children, ['value', 'label'])

  return (
    <SelectMenu
      options={(search
        ? searcher.search(search.replace(/^(@|#)/g, ''))
        : children
      ).map((x) => ({
        node: (
          <SelectorTag
            key={x.value}
            tag={x}
            channel={channel}
            role={role}
            onClick={() => {
              onChange(x.value)
              setSearch(null)
              menuDisclosure?.onClose()
            }}
          />
        )
      }))}
      popoverProps={{
        autoFocus: false,
        matchWidth: true,
        gutter: 0,
        returnFocusOnClose: false
      }}
    >
      {(triggerProps, disclosure, isHovering) => {
        menuDisclosure = disclosure
        const containerProps = {
          width: 'full',
          borderTop: '2px solid',
          borderLeft: '2px solid',
          borderRight: '2px solid',
          borderBottom: '0px solid',
          borderTopColor: disclosure.isOpen ? 'brand.100' : 'transparent',
          borderLeftColor: disclosure.isOpen ? 'brand.100' : 'transparent',
          borderRightColor: disclosure.isOpen ? 'brand.100' : 'transparent',
          borderBottomRadius: disclosure.isOpen ? 0 : 'md'
        }
        const selected =
          value !== undefined &&
          value !== null &&
          children.find((x) => x.value === value)

        return selected && !changing ? (
          <Box p={2} borderTopRadius="md" bg="lighter.5" {...containerProps}>
            <SelectorTag
              tag={selected}
              channel={channel}
              role={role}
              onClick={() => setChanging(true)}
            />
          </Box>
        ) : (
          <Input
            {...containerProps}
            placeholder={placeholder}
            _focus={{
              shadow: 'none'
            }}
            ref={(m) => {
              if (changing) m?.focus()
            }}
            onBlur={() => {
              setChanging(false)
              // disclosure.onClose()
            }}
            onFocus={() => {
              disclosure.onOpen()
            }}
            onChange={({ target }) => {
              disclosure.onOpen()
              setSearch(target.value)
            }}
            value={search ?? ''}
            autoComplete="off"
            {...triggerProps}
          />
        )
      }}
    </SelectMenu>
  )
}
