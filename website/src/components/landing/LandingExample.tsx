import { Image } from '@chakra-ui/image'
import { VStack } from '@chakra-ui/layout'

export interface LandingExampleProps {
  href?: string
  example: string
  align: 'left' | 'right'
}

export function LandingExample (props: LandingExampleProps) {
  return (
    <VStack>
      <Image src={props.example} w="1000px" />
      <small style={{
        // marginTop: '50px'
        float: props.align
      }}>The word "test" has been censored for this example.</small>
    </VStack>
  )
}
