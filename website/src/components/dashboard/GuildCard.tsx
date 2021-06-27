import Link from 'next/link'
import { ShortGuild } from 'typings'
import { GuildImage } from './GuildImage'

import styles from './GuildCard.module.scss'

export function GuildCard (props: ShortGuild) {
  return (
    <Link href={{
      pathname: '/dashboard/[guild]',
      query: { guild: props.i }
    }}>
      <div className={styles.card}>
        <GuildImage {...props} />
        <h1>{props.n}</h1>
      </div>
    </Link>
  )
}
