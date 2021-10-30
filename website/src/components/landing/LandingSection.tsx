import { useMinWidth } from '@/hooks/useMinWidth'
import { Box, HStack, Text } from '@chakra-ui/layout'
import React from 'react'
import { LandingExample } from './LandingExample'

interface LandingSectionOptions {
  ind: number
  children: string
  example: string
  href?: string
  title: string
  align: 'left' | 'right'
}

export function LandingSection(props: LandingSectionOptions) {
  const [mobiled] = useMinWidth(1190)

  const example = mobiled ? (
    ''
  ) : (
    <Box marginLeft={props.align === 'right' ? '20px' : undefined}>
      <LandingExample
        href={props.href}
        example={props.example}
        align={props.align}
      />
    </Box>
  )

  const text = (
    <Box
      textAlign={mobiled ? 'center' : props.align}
      marginLeft={props.align === 'left' ? '20px' : ''}
    >
      <Text textStyle="heading.xl">{props.title}</Text>
      <Text>{props.children}</Text>
    </Box>
  )

  return (
    <HStack
      data-aos="fade-up"
      data-aos-anchor-placement="top-bottom"
      gridGap="20px"
    >
      {!mobiled && props.align === 'left' ? (
        <>
          {example}
          {text}
        </>
      ) : (
        <>
          {text}
          {example}
        </>
      )}
    </HStack>
  )
}
