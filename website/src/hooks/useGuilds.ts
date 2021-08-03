import { Snowflake } from 'discord-api-types'
import { useDispatch, useSelector } from 'react-redux'
import { DeepPartial } from 'redux'
import { setCurrentGuild, setGuilds } from 'store/reducers/guilds.reducer'
import { Api } from 'structures/NewApi'
import { GuildDB } from 'typings'
import { RootState } from '../store'

import { LoginState } from '../store/reducers/auth.reducer'
import { useLoginState } from './useAuth'

import { setDb } from '../store/reducers/guilds.reducer'
import { updateObject } from 'utils/updateObject'
import { FormikHelpers } from 'formik'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

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
  const { currentGuild } = useGuildsState()
  const [loginState] = useLoginState()

  const [id, setId] = useState<Snowflake|undefined>(undefined)

  useEffect(() => {
    setId(router.query.guild as Snowflake)
  }, [router.query])

  if (id && loginState === LoginState.LoggedIn && selectedGuild !== id && 'window' in global) {
    console.log({ selectedGuild, id })
    if (selectedGuild) void Api.unsubscribe(selectedGuild)
    selectedGuild = id

    void Api.getGuild(id).then(guild => {
      if (!guild) return

      dispatch(setCurrentGuild(guild))
    })
  }

  const setGuildSettings = (db: DeepPartial<GuildDB>, old: boolean) => {
    if (!currentGuild || !id) return

    dispatch(setDb(updateObject(Object.apply({}, currentGuild.db as any), db)))

    if (!old) return Api.changeSettings(id, db)
  }

  return [
    currentGuild,
    async (db: DeepPartial<GuildDB>) => {
      void setGuildSettings(db, false)
    },
    async (value: any, helpers: FormikHelpers<any>) => {
      if (!currentGuild) return

      const old = { ...currentGuild.db }

      setGuildSettings(value, false)?.catch(() => {
        if (!currentGuild) return

        void setGuildSettings(old, true)
        for (const key in value) {
          value[key] = currentGuild[key as keyof CB.Data['currentGuild']]
        }

        helpers.setValues(value)
      })
    }
  ] as const
}

// export const useGuilds = () => {
//   const dispatch = useDispatch()
//   const { } = use
// }
