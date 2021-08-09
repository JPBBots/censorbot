import { Input } from '@chakra-ui/input'
import { createRef, useEffect, useState } from 'react'
import { Setting } from '~/settings/Setting'
import { searcher } from '~/settings/settings'
import { SettingSection } from '~/settings/SettingSection'

export default function AI () {
  const [searchTerm, setSearchTerm] = useState('')
  const searchInput = createRef<HTMLInputElement>()

  useEffect(() => {
    searchInput.current?.focus()
  }, [])

  const items = searcher.search(searchTerm)

  return (
    <SettingSection section="Search">
      <Input ref={searchInput} value={searchTerm} placeholder="Search settings..." onChange={({ target }) => {
        setSearchTerm(target.value)
      }} />

      {
        items.map(x => <Setting key={x.title ?? x.options[0].name} {...x} />)
      }
    </SettingSection>
  )
}
