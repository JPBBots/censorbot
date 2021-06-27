import React from 'react'
import { ShortGuild } from 'typings'
import styles from './GuildImage.module.scss'

import { generateGuildIcon } from 'utils/GenerateGuildIcon'

export class GuildImage extends React.Component<ShortGuild> {
  image = React.createRef<HTMLCanvasElement>()

  componentDidMount () {
    if (!this.image.current) return

    generateGuildIcon(this.props.n, this.image.current)
  }

  render () {
    if (this.props.a) {
      return (
        <img className={styles.guildImage} src={`https://cdn.discordapp.com/icons/${this.props.i}/${this.props.a}.png`} alt="https://cdn.discordapp.com/embed/avatars/1.png"></img>
      )
    }

    return (
      <canvas className={styles.guildImage} ref={this.image} height="100" width="100"></canvas>
    )
  }
}
