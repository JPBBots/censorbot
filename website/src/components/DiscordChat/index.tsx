import { VStack, HStack, Box } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/image'
import { Text } from '@chakra-ui/react'

export interface DiscordChatProps {
  image: string
  channelName: string
}

export function DiscordChat(props: DiscordChatProps) {
  return (
    <VStack
      bg="#36393F"
      p="16px"
      w="509px"
      h="281px"
      boxShadow="0px 4px 59px 7px rgba(0, 0, 0, 0.25)"
      borderRadius="20px"
      alignItems="center"
      flexGrow={0}
    >
      <VStack alignItems="flex-start" w="477px" h="193px" p="0px">
        <Image w="331px" h="193px" src={props.image} />
      </VStack>
      <HStack
        p="12px 16px"
        alignItems="center"
        w="477px"
        h="40px"
        bg="#40444B"
        borderRadius="10px"
      >
        <Box bg="#B9BBBE" borderRadius="100px" w="16px" h="16px" mx="3px" />
        <Text color="lighter.20" fontFamily="Roboto" fontSize="13px">
          Message #{props.channelName}
        </Text>
      </HStack>
    </VStack>
  )
}
