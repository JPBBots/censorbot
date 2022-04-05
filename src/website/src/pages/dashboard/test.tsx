import { Box } from '@chakra-ui/layout'
const font = 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif'

export default function Test() {
  return (
    <Box
      w="fit-content"
      borderColor="transparent"
      borderRadius="4px"
      borderLeft="5px solid"
      borderLeftColor="brand.100"
    >
      <Box
        w="fit-content"
        borderRadius="4px"
        borderLeftRadius="0px"
        color="#dcddde"
        fontFamily={font}
        fontStyle="normal"
        fontSize="14px"
        fontWeight={400}
        p="16px 16px 16px 12px"
        bg="#2f3136"
      >
        You're not allowed to say that...
      </Box>
    </Box>
  )
}
