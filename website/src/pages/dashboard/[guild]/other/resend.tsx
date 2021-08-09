import { SettingSection } from '~/settings/SettingSection'
import { sectionSettings } from '~/settings/Setting'

export default function Resend () {
  return (
    <SettingSection section="Resend" children={sectionSettings('Resend')} />
  )
}
