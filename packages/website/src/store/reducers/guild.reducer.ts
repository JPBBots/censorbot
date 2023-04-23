import { DeepPartial } from '@chakra-ui/react'
import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { GuildData, GuildDB } from '@censorbot/typings'
import { updateObject } from 'utils/updateObject'

export interface GuildContextType {
  currentGuild?: GuildData
  needsInvite?: boolean
  offlineInShard?: boolean
  volatileDb?: GuildDB
  id?: string
}

const initialState: GuildContextType = {
  needsInvite: false,
  offlineInShard: false
}

const slice = createSlice({
  name: 'guild',
  initialState: initialState,
  reducers: {
    setCurrentGuild: (state, action: PayloadAction<GuildData | undefined>) => {
      if (action.payload) {
        state.needsInvite = false
        state.offlineInShard = false
      }
      state.currentGuild = action.payload
      state.volatileDb = action.payload?.db
    },
    setId: (state, action: PayloadAction<string | undefined>) => {
      state.id = action.payload
    },
    setNeedsInvite: (state, action: PayloadAction<boolean>) => {
      state.needsInvite = action.payload
    },
    setOfflineInShard: (state, action: PayloadAction<boolean>) => {
      state.offlineInShard = action.payload
    },
    setDb: (state, action: PayloadAction<DeepPartial<GuildDB>>) => {
      if (state.currentGuild) {
        const newDb = updateObject(
          current(state.currentGuild.db),
          action.payload
        )
        state.currentGuild.db = newDb
        state.volatileDb = newDb
      }
    },
    setVolatileDb: (state, action: PayloadAction<DeepPartial<GuildDB>>) => {
      if (state.currentGuild) {
        state.volatileDb = updateObject(
          current(state.volatileDb),
          action.payload
        )
      }
    }
  }
})

export const guildReducer = slice.reducer
export const {
  setCurrentGuild,
  setId,
  setNeedsInvite,
  setOfflineInShard,
  setDb,
  setVolatileDb
} = slice.actions
