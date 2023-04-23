import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { Api } from 'structures/Api'
import Pieces from 'utils/Pieces'

import { GuildDB } from '@censorbot/typings'
import type { Snowflake } from 'discord-api-types/v9'

import { useLoginState } from './useAuth'
import { useGuilds, useUser } from './useUser'

import {
  setCurrentGuild,
  setId,
  setNeedsInvite,
  setOfflineInShard
} from 'store/reducers/guild.reducer'
import { RootState } from '../store'
import { LoginState } from '../store/reducers/auth.reducer'
import { setVolatileDb } from '../store/reducers/guild.reducer'

import { useDispatch, useSelector } from 'react-redux'
import type { DeepPartial } from 'redux'

export const useGuildState = (): RootState['guild'] =>
  useSelector((state: RootState) => state.guild)

let selectedGuild: Snowflake | undefined
let requestingGuild: Snowflake | undefined

export const useGuild = () => {
  const router = useRouter()

  const dispatch = useDispatch()
  const { user } = useUser(true)
  const { currentGuild, volatileDb, needsInvite, offlineInShard, id } =
    useGuildState()
  const [loginState] = useLoginState()
  const [guilds] = useGuilds()

  useEffect(() => {
    if (id !== router.query.guild) {
      dispatch(setId(router.query.guild?.toString()))
    }
    return () => {
      if (!router.query.guild && needsInvite) dispatch(setNeedsInvite(false))
    }
  }, [router.query.guild])

  const checkForGuild = async () => {
    if (selectedGuild === id && currentGuild) return

    if (
      requestingGuild !== id &&
      id &&
      guilds &&
      user &&
      loginState === LoginState.LoggedIn &&
      'window' in global
    ) {
      if (selectedGuild) void Api.unsubscribe(selectedGuild)

      dispatch(setCurrentGuild(undefined))

      requestingGuild = id

      return await Api.getGuild(id)
        .then((guild) => {
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
        .finally(() => {
          requestingGuild = undefined
        })
    }
  }
  useEffect(() => void checkForGuild(), [id, user, guilds, loginState])

  useEffect(() => {
    if (currentGuild && (needsInvite || offlineInShard)) {
      dispatch(setNeedsInvite(false))
      dispatch(setOfflineInShard(false))
    }
  }, [currentGuild])

  return {
    currentGuild,
    volatileDb,
    setGuildDb: (key: string, value: any) => {
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
    updateGuild: async () => await checkForGuild()
  } as const
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }
