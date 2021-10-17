import { HStack, Text } from '@chakra-ui/layout'
import React from 'react'
import { LandingExample } from './LandingExample'
import styles from './LandingSection.module.scss'

export function LandingSection (props: { ind: number, children: string, example: string, href?: string, title: string, align: 'left' | 'right', mobiled: boolean }) {
  const example = props.mobiled
    ? ''
    : <div className={props.align === 'right' ? styles.second : ''}>
    <LandingExample href={props.href} example={props.example} align={props.align} />
  </div>

  const text = <div className={props.align === 'left' ? styles.second : ''} style={{
    textAlign: props.mobiled ? 'center' : props.align
  }}>
    <Text textStyle="heading.xl">{props.title}</Text>
    <Text>{props.children}</Text>
  </div>

  return (
    <HStack data-aos="fade-up" data-aos-anchor-placement="top-bottom" gridGap="20px">
      {
        !props.mobiled && props.align === 'left'
          ? <>
              {example}
              {text}
            </>
          : <>
              {text}
              {example}
            </>
      }
    </HStack>
  )
}
