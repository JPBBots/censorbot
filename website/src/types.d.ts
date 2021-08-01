import { Api, ApiData, DataContext } from './structures/Api'
import type { AppProps } from 'next/app'
import React from 'react'

type CBAppProps = AppProps & {
  data: ApiData
}

declare global {
  namespace NodeJS {
    interface Global {
      api: Api
    }
  }

  namespace CB {
    export interface Data extends ApiData {}
    export interface Props extends CBAppProps {}
    export interface Context extends React.ContextType<typeof DataContext> {}
  }
}
