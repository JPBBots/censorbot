import { motion } from 'framer-motion'
import Image from 'next/image'

import { Box } from '@chakra-ui/react'

import { Logo } from '~/logo'

export default function Test() {
  return (
    <Box w="100px" h="100px" zIndex="5">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          type: 'spring',
          damping: 10,
          mass: 0.75,
          repeat: Infinity,
          stiffness: 100
        }}
      >
        <Logo />
      </motion.div>
    </Box>
  )
}
