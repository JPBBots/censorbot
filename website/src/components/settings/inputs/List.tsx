import React from 'react'
import { BaseInput } from './BaseInput'

export class List extends BaseInput<any, HTMLSelectElement, { number?: boolean }> {
  render () {
    return (
      <select ref={this.elm} value={this.props.value} onChange={(() => {
        const cur = this.elm.current
        if (!cur) return
        this.changeSetting(this.props.number ? Number(cur.value) : cur.value)
      })}>
        {this.props.children}
      </select>
    )
  }
}
