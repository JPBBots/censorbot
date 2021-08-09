import { Snowflake } from 'discord-api-types'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentGuild, setGuilds } from 'store/reducers/guilds.reducer'
import { Api } from 'structures/Api'
import { RootState } from '../store'

import { LoginState } from '../store/reducers/auth.reducer'
import { useLoginState } from './useAuth'

import { setVolatileDb } from '../store/reducers/guilds.reducer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Pieces from 'utils/Pieces'
import { DeepPartial } from '@chakra-ui/react'
import { GuildDB } from 'typings'

export const useGuildsState = (): RootState['guilds'] => useSelector((state: RootState) => state.guilds)

export const useGuilds = () => {
  const dispatch = useDispatch()
  const { guilds } = useGuildsState()
  const [loginState] = useLoginState()

  if (!guilds) {
    if (loginState === LoginState.LoggedIn) {
      Api.getGuilds().then(res => {
        if (!res) return

        dispatch(setGuilds(res))
      }).catch(() => {})
    }
  }

  return [
    guilds
  ] as const
}

let selectedGuild: Snowflake | undefined

export const useGuild = () => {
  const router = useRouter()

  const dispatch = useDispatch()
  const { currentGuild, volatileDb } = useGuildsState()
  const [loginState] = useLoginState()

  const [id, setId] = useState<Snowflake|undefined>(undefined)

  useEffect(() => {
    setId(Api.guildId)
  }, [router.query])

  if (id && loginState === LoginState.LoggedIn && selectedGuild !== id && 'window' in global) {
    if (selectedGuild) void Api.unsubscribe(selectedGuild)
    selectedGuild = id

    void Api.getGuild(id).then(guild => {
      if (!guild) return

      dispatch(setCurrentGuild(guild))
    })
  }

  return [
    currentGuild,
    volatileDb,
    (key: string, value: any) => {
      if (!currentGuild || !id) return

      let obj: Record<any, any> = {}
      obj[key] = value

      obj = Pieces.normalize(obj) as DeepPartial<GuildDB>

      dispatch(setVolatileDb(obj))

      Api.changeSettings(id, obj).catch(() => {
        dispatch(setVolatileDb(currentGuild.db))
      })
    }
  ] as const
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }
