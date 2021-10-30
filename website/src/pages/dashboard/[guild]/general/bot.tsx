import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function Bot() {
  return <SettingSection section="Bot" children={sectionSettings('Bot')} />
}
