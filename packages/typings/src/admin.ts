export enum AdminAction {
  Restart,
  InvalidateCache
}

export type AdminActionObject =
  | {
      type: AdminAction.Restart
      process: `${number}` | 'API' | 'NA-1H' | 'NA-2H' | 'EU-1' | 'SA-1'
    }
  | {
      type: AdminAction.InvalidateCache
      cache: 'api' | 'db'
    }
