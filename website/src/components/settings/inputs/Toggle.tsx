import React from 'react'
import { BaseInput } from './BaseInput'

export class Toggle extends BaseInput<boolean> {
  elm = React.createRef<HTMLInputElement>()

  render () {
    return (
      <input ref={this.elm} onChange={(() => {
        const cur = this.elm.current
        if (!cur) return
        this.changeSetting(cur.checked)
      })} type="checkbox" checked={this.props.value} />
    )
  }
}
