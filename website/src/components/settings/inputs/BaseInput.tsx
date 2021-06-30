import { api } from 'pages/_app'
import React from 'react'

import Router from 'next/router'
import { Snowflake } from 'discord-api-types'

export class BaseInput <Value extends any> extends React.Component<{ setting: string, value: Value, customGet?: (elm: React.RefObject<HTMLElement>) => any, extra?: any }> {
  elm!: React.RefObject<HTMLElement>

  componentDidMount () {
    if (this.elm.current) {
      this.elm.current.setAttribute('data-setting', this.props.setting)
      this.elm.current.setAttribute('data-extra', this.props.extra)
    }
  }

  changeSetting (value: Value) {
    if (!api.data.currentGuild) return

    if (this.props.customGet) value = this.props.customGet(this.elm)

    console.debug(`Changing ${this.props.setting} to ${value}`)

    const dat = {} as Record<any, any>
    dat[this.props.setting] = value

    api.setData({ currentGuild: api._createUpdatedGuild(api.data.currentGuild, dat) })

    // TODO

    console.log(dat)

    void api.changeSettings(Router.query.guild as Snowflake, dat)
  }
}
