import { useRouter } from 'next/router'
import React, { PropsWithChildren } from 'react'
import Link from 'next/link'

export function SettingsSectionElement (props: PropsWithChildren<{}>) {
  const sections = {
    General: '/',
    Filter: '/filter'
  } as const

  return (
    <>
      {Object.keys(sections).map((section) => (
        <Link href={{
          pathname: `/dashboard/[guild]${sections[section as keyof typeof sections]}`,
          query: useRouter().query
        }}>{section}</Link>
      ))}

      <h1>b</h1>
      {props.children}
    </>
  )
}

export class SettingsSection extends React.Component {
}
