import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function Response () {
  return (
    <SettingSection section="Response" description="Message that appears after a filter is triggered" children={sectionSettings('Response')} />
  )
}
