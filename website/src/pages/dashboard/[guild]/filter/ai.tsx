import React from 'react'
import { Toggle } from '~/settings/inputs/Toggle'
import { Setting } from '~/settings/Setting'
import { SettingsSection, SettingsSectionElement } from '~/settings/SettingsSection'

export default class FilterSection extends SettingsSection {
  render () {
    if (!this.db) return <div></div>

    return (
      <SettingsSectionElement ctx={this.context}>
        <h1>AI</h1>

        <div>
          <Setting premium={true} title="Toxicity Filter" description="Filter out toxic messages with AI">
            <Toggle setting="toxicity" value={this.db.toxicity} />
          </Setting>
          <Setting premium={true} title="Anti-NSFW Images" description="Improve upon Discord's built in image moderation, with a more aggressive AI">
            <Toggle setting="images" value={this.db.images} />
          </Setting>
          <Setting premium={true} title="OCR" description="Optical Character Recognition, which takes an image and scans the text in it">
            <Toggle setting="ocr" value={this.db.ocr} />
          </Setting>
        </div>
      </SettingsSectionElement>
    )
  }
}
