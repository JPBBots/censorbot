import {
  Box,
  BoxProps,
  InputProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
  useBoolean,
  useDisclosure
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { UseDisclosureReturn } from '@chakra-ui/hooks'

export interface SelectMenuOption {
  name?: string
  node?: ReactNode
  onClick?(): void
}

export interface SelectMenuProps {
  options: SelectMenuOption[]
  popoverProps?: Omit<PopoverProps, 'children'>
  children(
    triggerProps: BoxProps | InputProps,
    disclosureProps: UseDisclosureReturn,
    isHoveringResults: boolean
  ): ReactNode
}

export const SelectMenu = ({
  options,
  children,
  popoverProps
}: SelectMenuProps) => {
  const { onClose, ...disclosureProps } = useDisclosure()
  const [isHovering, isHoveringState] = useBoolean(false)
  const [isHoveringTrigger, isHoveringTriggerState] = useBoolean(false)
  return (
    <Popover
      {...disclosureProps}
      onClose={!isHovering && !isHoveringTrigger ? onClose : undefined}
      {...(popoverProps || {})}
    >
      <PopoverTrigger>
        {children(
          {
            onMouseEnter: isHoveringTriggerState.on,
            onMouseLeave: isHoveringTriggerState.off
          },
          { ...disclosureProps, onClose },
          isHovering || isHoveringTrigger
        )}
      </PopoverTrigger>
      <PopoverContent
        onMouseEnter={isHoveringState.on}
        onMouseLeave={isHoveringState.off}
      >
        <PopoverBody>
          {options.map((option, index) => (
            <Box key={index} onClick={option.onClick} w="full">
              {option.node}
            </Box>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
