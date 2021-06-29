import { PropsWithChildren } from 'react'
import styles from './MidContainer.module.scss'

export function MidContainer (props: PropsWithChildren<{}>) {
  return (
    <div className={styles.container}>
      {props.children}
    </div>
  )
}
