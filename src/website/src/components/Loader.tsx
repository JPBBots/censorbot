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
        animate={{ rotate: 360 }}
        style={{
          cursor: 'grab',
          userSelect: 'none'
        }}
        transition={{
          type: 'spring',
          damping: 10,
          mass: 0.75,
          repeat: Infinity,
          stiffness: 100
        }}
        whileTap={{ cursor: 'grabbing' }}
        drag
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 20
        }}
        dragElastic={0.5}
        dragConstraints={{
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }}
      >
        <Logo />
      </motion.div>
    </Box>
  )
}
