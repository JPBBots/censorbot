import { OptionProps, Option as CCOption } from '@jpbbots/censorbot-components'
import { useGuild } from 'hooks/useGuilds'

import Router from 'next/router'
import { Logger } from 'structures/Logger'

export function Option({ onChange, name, ...props }: OptionProps) {
  const [currentGuild] = useGuild()

  return (
    <CCOption
      name={name}
      {...props}
      onChange={(ev) => {
        if (props.isPremium && currentGuild && !currentGuild.premium) {
          Logger.error('This is premium only!')
          ev.preventDefault()

          void Router.replace({
            pathname: '/dashboard/[guild]/premium',
            query: Router.query,
          })
        } else if (onChange) {
          onChange(ev)
        }
      }}
    />
  )
}
