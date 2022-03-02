import { Snowflake } from 'discord-api-types'
import { useDispatch, useSelector } from 'react-redux'
import {
  setCurrentGuild,
  setGuilds,
  setNeedsInvite,
  setOfflineInShard
} from 'store/reducers/guilds.reducer'
import { Api } from 'structures/Api'
import { RootState } from '../store'

import { LoginState } from '../store/reducers/auth.reducer'
import { useHeadless, useLoginState, useUser } from './useAuth'

import { setVolatileDb } from '../store/reducers/guilds.reducer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Pieces from 'utils/Pieces'
import { DeepPartial } from '@chakra-ui/react'
import { GuildDB } from '@jpbbots/cb-typings'
import headlessData from '@/structures/headlessData.json'

export const useGuildsState = (): RootState['guilds'] =>
  useSelector((state: RootState) => state.guilds)

let requesting = false

export const useGuilds = () => {
  const dispatch = useDispatch()
  const { guilds } = useGuildsState()
  const [loginState] = useLoginState()
  const [user] = useUser(true)

  useEffect(() => {
    if (!guilds && !requesting && user) {
      if (loginState === LoginState.LoggedIn) {
        requesting = true
        Api.getGuilds()
          .then((res) => {
            if (!res) return

            dispatch(setGuilds(res))
          })
          .catch(() => {})
          .finally(() => {
            requesting = false
          })
      }
    }
  }, [user, loginState])

  return [guilds] as const
}

let selectedGuild: Snowflake | undefined

export const useGuild = () => {
  const [headless] = useHeadless()
  const router = useRouter()

  const dispatch = useDispatch()
  const [user] = useUser(true)
  const { currentGuild, volatileDb, needsInvite, offlineInShard } =
    useGuildsState()
  const [loginState] = useLoginState()
  const [guilds] = useGuilds()

  const [id, setId] = useState<Snowflake | undefined>(undefined)

  useEffect(() => {
    setId(Api.guildId)

    return () => {
      dispatch(setNeedsInvite(false))
    }
  }, [router.query])

  const checkForGuild = async () => {
    if (selectedGuild === id && currentGuild) return
    if (headless) {
      dispatch(setCurrentGuild(headlessData.currentGuild as any))
    }
    if (
      id &&
      guilds &&
      user &&
      loginState === LoginState.LoggedIn &&
      'window' in global
    ) {
      if (selectedGuild) void Api.unsubscribe(selectedGuild)

      dispatch(setCurrentGuild(undefined))

      return await Api.getGuild(id).then((guild) => {
        if (!guild) return (selectedGuild = undefined)

        selectedGuild = id

        if ('notInGuild' in guild) {
          dispatch(setNeedsInvite(true))

          return null
        } else if ('offlineInShard' in guild) {
          dispatch(setOfflineInShard(true))

          return null
        } else {
          dispatch(setCurrentGuild(guild))

          return guild
        }
      })
    }
  }
  useEffect(() => void checkForGuild(), [loginState, guilds, id, user])

  useEffect(() => {
    if (currentGuild) {
      dispatch(setNeedsInvite(false))
      dispatch(setOfflineInShard(false))
    }
  }, [currentGuild])

  return [
    currentGuild,
    volatileDb,
    (key: string, value: any) => {
      if (!currentGuild) return

      let obj: Record<any, any> = {}
      obj[key] = value

      obj = Pieces.normalize(obj) as DeepPartial<GuildDB>

      dispatch(setVolatileDb(obj))

      Api.changeSettings(currentGuild.guild.id, obj).catch(() => {
        dispatch(setVolatileDb(currentGuild.db))
      })
    },
    needsInvite,
    offlineInShard,
    id,
    async () => await checkForGuild()
  ] as const
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }
