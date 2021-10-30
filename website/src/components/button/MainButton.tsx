import Link from 'next/link'

import styles from './MainButton.module.scss'

export function MainButton(props: JSX.IntrinsicElements['a']) {
  return (
    <Link href={props.href ?? ''}>
      <a className={styles.button} {...props}>
        {props.children}
      </a>
    </Link>
  )
}
