import { FlexProps, Flex } from '@chakra-ui/react'

export function MiddleWrap(
  props: FlexProps & { spacing?: `${number}px`; reverse?: boolean }
) {
  return (
    <Flex
      wrap={props.reverse ? 'wrap-reverse' : 'wrap'}
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      gridGap={props.spacing}
      {...props}
    />
  )
}
