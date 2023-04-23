import {
  TagLabel,
  TagLeftIcon,
  TagCloseButton,
  Tag as ChakraTag,
  TagProps as ChakraTagProps,
  Button
} from '@chakra-ui/react'
import { FaAt, FaHashtag } from 'react-icons/fa'

interface TagProps extends ChakraTagProps {
  color?: string
  label?: string

  isRole?: boolean
  isChannel?: boolean

  onDelete?(): void
}

export const Tag = ({
  color,
  label,
  isRole,
  isChannel,
  onDelete,
  ...chakraTagProps
}: TagProps) => {
  const buttonTagProps =
    chakraTagProps.onClick || onDelete
      ? {
          as: Button,
          cursor: 'pointer'
        }
      : {
          cursor: 'default'
        }

  return (
    <ChakraTag
      colorScheme={color}
      onClick={onDelete}
      {...buttonTagProps}
      {...chakraTagProps}
    >
      {isRole && (
        <TagLeftIcon color={color || 'inherit'} boxSize={4} as={FaAt} />
      )}
      {isChannel && (
        <TagLeftIcon color={color || 'inherit'} boxSize={4} as={FaHashtag} />
      )}
      {label && <TagLabel>{label}</TagLabel>}
      {onDelete && <TagCloseButton as="div" />}
    </ChakraTag>
  )
}
