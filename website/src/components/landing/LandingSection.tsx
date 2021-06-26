import { LandingExample } from './LandingExample'
import styles from './LandingSection.module.scss'

export function LandingSection (props: { children: string, example: string, href?: string, title: string, align: 'left' | 'right' }) {
  const example = <div className={props.align === 'right' ? styles.second : ''}>
    <LandingExample href={props.href} example={props.example} align={props.align} />
  </div>
  const text = <div className={props.align === 'left' ? styles.second : ''} style={{
    textAlign: props.align
  }}>
    <h1>{props.title}</h1>
    <p>{props.children}</p>
  </div>

  return (
    <section className={styles.section}>
      {
        props.align === 'left'
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
