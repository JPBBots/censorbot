import { motion } from 'framer-motion'
import { useLoading } from 'hooks/useLoading'
import { Logo } from './logo'

import { Box } from '@chakra-ui/react'

export function Loader() {
  const [loading] = useLoading()

  return (
    <Box
      position="fixed"
      bottom="10px"
      right="10px"
      w="100px"
      h="100px"
      zIndex="5"
    >
      <motion.div
        hidden={!loading}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          flip: Infinity
        }}
      >
        <Logo />
      </motion.div>
    </Box>
  )
}
