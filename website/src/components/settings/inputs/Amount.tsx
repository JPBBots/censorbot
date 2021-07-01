import React from 'react'
import { BaseInput } from './BaseInput'

export class Amount extends BaseInput<number, HTMLInputElement> {
  render () {
    return (
      <input ref={this.elm} onChange={(() => {
        const cur = this.elm.current
        if (!cur) return
        this.changeSetting(Number(cur.value))
      })} type="number" value={this.props.value} />
    )
  }
}
