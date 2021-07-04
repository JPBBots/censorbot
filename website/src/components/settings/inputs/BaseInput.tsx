import { api } from 'pages/_app'
import React from 'react'

import Router from 'next/router'
import { Snowflake } from 'discord-api-types'

export interface InputProps<Value extends any, Element extends HTMLElement> {
  children?: React.ReactNode[]
  setting: string
  value: Value
  customGet?: (elm: React.RefObject<Element>) => any
}

export class BaseInput <Value extends any, Element extends HTMLElement, Extra = any> extends React.Component<InputProps<Value, Element> & Extra> {
  elm: React.RefObject<Element> = React.createRef()
  inputType!: Readonly<InputProps<Value, HTMLInputElement> & Extra>

  componentDidMount () {
    if (this.elm.current) {
      this.elm.current.setAttribute('data-setting', this.props.setting);

      (Object.keys(this.props) as Array<keyof this['inputType']>).forEach(prop => {
        if (prop.toString().startsWith('data-')) {
          this.elm.current?.setAttribute(prop.toString(), String((this.props as this['inputType'])[prop]))
        }
      })
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
