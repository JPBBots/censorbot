import { Image, ImageProps } from '@chakra-ui/image'

import BRANDING from 'BRANDING'

export function Logo(props: Omit<ImageProps, 'draggable' | 'src'>) {
  return <Image draggable="false" src={BRANDING.logo} {...props} />
}
