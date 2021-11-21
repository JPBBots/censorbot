import Link from 'next/link'

import styles from './NavButton.module.scss'

export function NavButton(
  props: JSX.IntrinsicElements['a'] & { special?: 'on' }
) {
  return (
    <Link href={props.href ?? '#'}>
      <a
        className={`${styles.button}${
          props.special === 'on' ? ` ${styles.special}` : ''
        }`}
        {...props}
      >
        {props.children}
      </a>
    </Link>
  )
}
