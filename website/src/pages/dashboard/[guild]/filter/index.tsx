import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function General () {
  return (
    <SettingSection section="General" children={sectionSettings('General')} />
  )
}
