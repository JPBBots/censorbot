import { BaseInput } from './BaseInput'
import React from 'react'

// TODO
export class Tags extends BaseInput<string[], any> {
  render () {
    return (
      <h6 ref={this.elm}>{this.props.value.join(' ')}</h6>
    )
  }
}
