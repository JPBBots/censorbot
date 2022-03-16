import { hex } from 'chroma-js'

export * from './PremiumCard'

export const leftGradient = hex('#6C7BFF')
export const rightGradient = hex('#31B5FF')

export const textGrad = `linear(to-r, ${leftGradient.hex()} 6.89%, ${rightGradient.hex()}) 97.5%`
export const boxGrad = `linear(to-br, ${leftGradient
  .alpha(0.2)
  .hex()} 0%, ${rightGradient.alpha(0).hex()}) 100%`
