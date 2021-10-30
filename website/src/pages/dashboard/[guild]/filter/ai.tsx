import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function AI() {
  return <SettingSection section="AI" children={sectionSettings('AI')} />
}
