import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function Exceptions () {
  return (
    <SettingSection section="Exceptions" children={sectionSettings('Exceptions')} />
    // <SettingSection section="Exceptions">
    //   {}
    // </SettingSection>
  )
}
