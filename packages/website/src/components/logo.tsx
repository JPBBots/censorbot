import { Image, ImageProps } from '@chakra-ui/react'
import BRANDING from 'BRANDING'

export function Logo(props: Omit<ImageProps, 'draggable' | 'src'>) {
  return <Image draggable="false" src={BRANDING.logo} {...props} />
}
