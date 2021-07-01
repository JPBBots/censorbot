import React from 'react'
import { BaseInput } from './BaseInput'

export class Text extends BaseInput<string | null, HTMLInputElement> {
  state = {
    changing: false
  }

  render () {
    return (
      <input ref={this.elm} onChange={(() => {
        this.setState({ changing: false })
        const cur = this.elm.current
        if (!cur) return
        this.changeSetting(cur.value === this.props.extra || cur.value === '' ? null : cur.value)
      })} onSelect={(() => {
        if (this.props.value === null) {
          this.setState({ changing: true })
        }
      })} onBlur={(() => {
        this.setState({ changing: false })
      })} value={this.state.changing ? '' : this.props.value ?? this.props.extra} />
    )
  }
}
