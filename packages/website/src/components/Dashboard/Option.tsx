import { Switch, SwitchProps } from '@chakra-ui/switch'
import { Icon } from '@chakra-ui/icon'
import { FormControl } from '@chakra-ui/form-control'
import { Text, HStack } from '@chakra-ui/layout'
import { FaCrown } from 'react-icons/fa'

export interface OptionProps extends SwitchProps {
  name: string
  label: string
  isPremium?: boolean
  isDisabled?: boolean
}

export const Option = ({
  name,
  label,
  isPremium,
  isDisabled,
  ...switchProps
}: OptionProps) => {
  const color = isPremium
    ? `brand.${isDisabled ? 60 : 100}`
    : `lighter.${isDisabled ? 20 : 60}`

  return (
    <FormControl>
      <HStack
        as="label"
        htmlFor={name}
        p={4}
        w="full"
        rounded="sm"
        color={color}
        cursor="pointer"
        justify="space-between"
        transition=".12s ease"
        _hover={{ bg: 'lighter.5' }}
        pointerEvents={isDisabled ? 'none' : 'all'}
      >
        <HStack spacing={4}>
          {isPremium && <Icon size={4} as={FaCrown} />}
          <Text textStyle="heading.sm" color="inherit">
            {label}
          </Text>
        </HStack>
        <Switch
          id={name}
          name={name}
          aria-label={label}
          isDisabled={isDisabled}
          {...switchProps}
        />
      </HStack>
    </FormControl>
  )
}
