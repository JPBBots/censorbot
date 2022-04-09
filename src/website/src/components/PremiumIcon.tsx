import { Icon, IconProps } from '@chakra-ui/react'
import { FaCrown } from 'react-icons/fa'

export interface PremiumIconProps extends IconProps {
  notColored?: boolean
}

export function PremiumIcon({ notColored, ...props }: PremiumIconProps) {
  return (
    <Icon
      color={notColored ? undefined : 'brand.100'}
      as={FaCrown}
      {...props}
    />
  )
}

export function GradientPremiumIcon() {
  return (
    <svg
      width="200"
      height="160"
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M165 140H35C32.25 140 30 142.25 30 145V155C30 157.75 32.25 160 35 160H165C167.75 160 170 157.75 170 155V145C170 142.25 167.75 140 165 140ZM185 40C176.719 40 170 46.7188 170 55C170 57.2187 170.5 59.2813 171.375 61.1875L148.75 74.75C143.938 77.625 137.719 76 134.937 71.125L109.469 26.5625C112.812 23.8125 115 19.6875 115 15C115 6.71875 108.281 0 100 0C91.7188 0 85 6.71875 85 15C85 19.6875 87.1875 23.8125 90.5313 26.5625L65.0625 71.125C62.2812 76 56.0313 77.625 51.25 74.75L28.6562 61.1875C29.5 59.3125 30.0312 57.2187 30.0312 55C30.0312 46.7188 23.3125 40 15.0312 40C6.75 40 0 46.7188 0 55C0 63.2812 6.71875 70 15 70C15.8125 70 16.625 69.875 17.4063 69.75L40 130H160L182.594 69.75C183.375 69.875 184.188 70 185 70C193.281 70 200 63.2812 200 55C200 46.7188 193.281 40 185 40Z"
        fill="url(#paint0_linear_999_2068)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_999_2068"
          x1="0"
          y1="0"
          x2="156.098"
          y2="195.122"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F97171" />
          <stop offset="1" stopColor="#D63F3F" />
        </linearGradient>
      </defs>
    </svg>
  )
}
