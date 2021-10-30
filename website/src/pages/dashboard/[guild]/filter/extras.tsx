import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function Filter() {
  return (
    <SettingSection section="Extras" children={sectionSettings('Extras')} />
  )
}
