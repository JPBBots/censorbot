import { Icon } from '@chakra-ui/react'
import { FaCrown } from 'react-icons/fa'

export function PremiumIcon(props: { notColored?: boolean }) {
  return (
    <Icon color={props.notColored ? undefined : 'brand.100'} as={FaCrown} />
  )
}
