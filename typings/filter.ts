export const BASE_FILTERS = ['en', 'es', 'off', 'de', 'ru'] as const

export type baseFilters = typeof BASE_FILTERS[number]

export const baseFilterNames: {
  [key in baseFilters]: string
} = {
  en: 'English',
  es: 'Spanish',
  off: 'Offensive',
  de: 'German',
  ru: 'Russian'
}

export enum FilterType {
  BaseFilter = 1,
  ServerFilter = 2,
  Invites = 4,
  Toxicity = 8,
  Images = 16,
  Phishing = 32
}

export const allFilterTypes =
  FilterType.BaseFilter |
  FilterType.ServerFilter |
  FilterType.Invites |
  FilterType.Toxicity |
  FilterType.Images |
  FilterType.Phishing

export const filterTypeNames = {
  [FilterType.BaseFilter]: 'Base Filter',
  [FilterType.ServerFilter]: 'Server Filter',
  [FilterType.Invites]: 'Invites',
  [FilterType.Toxicity]: 'Toxicity Filter',
  [FilterType.Images]: 'Anti-NSFW Images',
  [FilterType.Phishing]: 'Anti-Phishing Links'
}

export type Range = [number, number] | []

export type FilterResultInfo =
  | {
      type: FilterType.BaseFilter
      ranges: Range[]
      filters: baseFilters[]
      places: string[]
    }
  | {
      type: FilterType.ServerFilter
      places: string[]
    }
  | {
      type: FilterType.Images | FilterType.Toxicity
      percentage: string
    }
  | {
      type: FilterType.Invites | FilterType.Phishing
    }
