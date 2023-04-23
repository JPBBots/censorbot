import { createIcon } from '@chakra-ui/icon'

export const Upper = createIcon({
  displayName: 'UpperWave',
  defaultProps: {
    w: '100vw',
    h: '212px',
    fill: 'brand.100',
    minW: '1920px',
    preserveAspectRatio: 'none'
  },
  viewBox: '0 0 1920 212',
  path: (
    <path d="M1920 431L0.00012207 431L3.17345e-05 67.9998C3.17345e-05 67.9998 207.888 127.1 480.25 88.9215C858.447 35.9094 950.045 -14.6121 1122.58 3.90215C1327.69 25.9072 1367.13 91.6322 1556.81 162.939C1649.24 197.687 1724.9 206.409 1920 195.946" />
  )
})
export const Lower = createIcon({
  displayName: 'LowerWave',
  defaultProps: {
    w: '100vw',
    h: '212px',
    fill: 'brand.100',
    minW: '1920px',
    preserveAspectRatio: 'none'
  },
  viewBox: '0 0 1920 212',
  path: (
    <path d="M0 -219L1920 -219L1920 144C1920 144 1712.11 84.8996 1439.75 123.078C1061.55 176.09 969.955 226.612 797.415 208.098C592.308 186.093 552.868 120.368 363.189 49.0614C270.761 14.3134 195.102 5.59145 0 16.0538" />
  )
})
