import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GuildData, GuildDB, ShortGuild } from 'typings'

export interface GuildsContextType {
  guilds?: ShortGuild[]
  currentGuild?: GuildData
}

const initialState: GuildsContextType = {}

const slice = createSlice({
  name: 'guilds',
  initialState: initialState,
  reducers: {
    setGuilds: (state, action: PayloadAction<ShortGuild[]>) => {
      state.guilds = action.payload
    },
    setCurrentGuild: (state, action: PayloadAction<GuildData>) => {
      state.currentGuild = action.payload
    },
    setDb: (state, action: PayloadAction<GuildDB>) => {
      if (state.currentGuild) {
        state.currentGuild.db = action.payload
      }
    }
  }
})

export const guildsReducer = slice.reducer
export const { setGuilds, setCurrentGuild, setDb } = slice.actions
