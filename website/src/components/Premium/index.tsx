import { hex } from 'chroma-js'

export * from './PremiumCard'

export const leftGradient = hex('#6C7BFF')
// export const leftGradient = hex('#F97171')
export const rightGradient = hex('#31B5FF')
// export const rightGradient = hex('#D63F3F')

export const textGrad = `linear(to-r, ${leftGradient.hex()} 6.89%, ${rightGradient.hex()}) 97.5%`
export const boxGrad = `linear(to-br, ${leftGradient
  .alpha(0.2)
  .hex()} 0%, ${rightGradient.alpha(0).hex()}) 100%`

export const brandGrad = `linear(135deg, #F97171 0%, #D63F3F 100%)`
