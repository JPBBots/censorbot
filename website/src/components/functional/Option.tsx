import { OptionProps, Option as CCOption } from '@jpbbots/censorbot-components'
import { api } from 'pages/_app'

import Router from 'next/router'
import { Logger } from 'structures/Logger'

export function Option ({ onChange, name, ...props }: OptionProps) {
  return (
    <CCOption name={name} {...props} onChange={(ev) => {
      window.router = Router
      console.log('a', props.isPremium && api.data.currentGuild && !api.data.currentGuild.premium)
      if (props.isPremium && api.data.currentGuild && !api.data.currentGuild.premium) {
        Logger.error('This is premium only!')
        ev.preventDefault()

        void Router.replace({
          pathname: '/dashboard/[guild]/premium',
          query: Router.query
        })
      } else if (onChange) {
        onChange(ev)
      }
    }} />
  )
}
