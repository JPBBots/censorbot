import React from 'react'
import { LandingExample } from './LandingExample'
import styles from './LandingSection.module.scss'

export function LandingSection (props: { ind: number, children: string, example: string, href?: string, title: string, align: 'left' | 'right', mobiled: boolean }) {
  const example = <div className={props.align === 'right' ? styles.second : ''}>
    <LandingExample href={props.href} example={props.example} align={props.align} mobiled={props.mobiled} />
  </div>
  const text = <div className={props.align === 'left' ? styles.second : ''} style={{
    textAlign: props.mobiled ? 'center' : props.align
  }}>
    <h1>{props.title}</h1>
    <p>{props.children}</p>
  </div>

  return (
    <section data-aos="fade-up" data-aos-anchor-placement="top-bottom" className={styles.section}>
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
    </section>
  )
}
