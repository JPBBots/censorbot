import { BaseInput } from './BaseInput'
import React from 'react'

import Tagify, { TagData } from '@yaireo/tagify'
import '@yaireo/tagify/dist/tagify.css'

// TODO
export class Tags extends BaseInput<string[], HTMLInputElement, { settings: Tagify.TagifySettings, placeholder: string }> {
  tag?: Tagify
  settingTag = false

  componentDidMount () {
    if (!this.elm.current) return

    if (!this.tag) this.tag = new Tagify(this.elm.current, this.props.settings)

    this.tag?.on?.('change', () => {
      if (this.settingTag) return

      if (!this.elm.current || this.elm.current.value === '') return this.changeSetting([])

      this.changeSetting((JSON.parse(this.elm.current.value) as TagData[])
        .reduce<string[]>((a, b: TagData) => a.concat([b.id || b.value]), [])
      )
    })

    this.updateTags()
  }

  componentDidUpdate () {
    this.updateTags()
  }

  shouldComponentUpdate (nextProps: this['inputType']): boolean {
    if (!this.tag) return true

    return JSON.stringify(this.props.value.sort()) !== JSON.stringify(nextProps.value.sort())
  }

  updateTags () {
    if (!this.elm.current) return
    this.settingTag = true

    if (this.tag?.settings) this.tag.removeAllTags()

    const tags: string[] = []

    if (this.props.settings?.whitelist && this.props.settings.whitelist.length > 0) {
      (this.props.settings.whitelist as TagData[]).filter(x => this.props.value.includes(x.id)).forEach(x => tags.push(x.value))
    } else {
      this.props.value.forEach(x => tags.push(x))
    }

    if (this.tag) this.tag.addTags(tags)
    else {
      this.elm.current.value = JSON.stringify(tags.map(x => ({
        value: x
      })))
    }

    this.settingTag = false
  }

  render () {
    return (
      <input placeholder={this.props.placeholder} ref={this.elm} defaultValue={this.props.value}></input>
    )
  }
}
