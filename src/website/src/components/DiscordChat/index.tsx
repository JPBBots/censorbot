import { Box, HStack, VStack, Text, StackProps } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/react'
import { hex } from 'chroma-js'
import Typist from 'react-typist'
import { useEffect, useState } from 'react'
import { MotionHStack, MotionText, MotionVStack } from '~/motion'
import BRANDING from '@/BRANDING'
import { Utils } from '@/utils/Utils'
import { useUser } from '@/hooks/useAuth'

const discordBg = hex('#36393f')
const chatInputBg = hex('#40444B')
const attachmentButton = hex('#B9BBBE')

const font = 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif'

interface DiscordMessageProps {
  content: any
  avatarUrl?: string
  username?: string
}

export function DiscordMessage({
  content,
  avatarUrl = 'https://cdn.discordapp.com/embed/avatars/1.png',
  username = 'User'
}: DiscordMessageProps) {
  return (
    <MotionHStack
      w="full"
      h="fit-content"
      spacing="13px"
      alignItems="flex-start"
      alignSelf="flex-end"
      textAlign="left"
      transition={{
        duration: 0.2
      }}
      animate={{
        y: [50, 0]
      }}
    >
      <Image
        src={avatarUrl}
        borderRadius="full"
        marginTop="3px"
        w="40px"
        h="40px"
      />
      <VStack
        spacing={typeof content === 'string' ? '0px' : '4px'}
        alignItems="flex-start"
        w="full"
      >
        <Text
          fontSize="1rem"
          fontWeight={500}
          lineHeight="1.375rem"
          fontFamily={font}
          color="white"
        >
          {username}
        </Text>
        <Text
          fontSize="1rem"
          lineHeight="1.375rem"
          color="#dcddde"
          fontWeight={400}
        >
          {content}
        </Text>
      </VStack>
    </MotionHStack>
  )
}

interface TypingSettings extends DiscordMessageProps {
  waitAfter?: number
  onDone?: () => void
}

export function DiscordChat(props: StackProps) {
  const [chats, setChats] = useState<DiscordMessageProps[]>([
    { content: 'hello world' }
  ])
  const [typing, setTyping] = useState<TypingSettings>()
  const { user } = useUser(false)

  const run = (ind: number = 0) => {
    const messages = ['fuck', 'f u c k', 'f!u!c!k', 'sh!t', '$h1t']
    if (!messages[ind]) ind = 0

    setTyping({
      content: messages[ind],
      waitAfter: 400,
      onDone: () => {
        setChats([
          {
            content: (
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
                  p="12px 16px 12px 12px"
                  bg="#2f3136"
                >
                  You're not allowed to say that...
                </Box>
              </Box>
            ),
            avatarUrl: BRANDING.logo,
            username: 'Censor Bot'
          }
        ])
        setTimeout(() => {
          setChats([])
          setTimeout(() => run(ind + 1), 400)
        }, 2e3)
      }
    })
  }

  useEffect(() => {
    // run()
  }, [])

  return (
    <MotionVStack
      bg={discordBg.hex()}
      borderRadius="md"
      p="16px"
      justify="space-between"
      {...(props as any)}
      transition={{}}
      animate="animate"
    >
      <VStack
        w="full"
        h="full"
        justify="flex-end"
        align="left"
        mt="auto"
        mb="10px"
      >
        {chats.map((x) => (
          <DiscordMessage key={x.content} {...x} />
        ))}
      </VStack>
      <HStack
        w="full"
        bg={chatInputBg.hex()}
        borderRadius="md"
        zIndex={1}
        p="12px 16px"
        spacing="15px"
      >
        <Box
          w="22px"
          h="22px"
          bg={attachmentButton.hex()}
          borderRadius="full"
          onClick={() => run()}
        />
        <MotionText
          fontSize="16px"
          opacity={typing ? 1 : 0.2}
          fontFamily={font}
          fontStyle="normal"
          userSelect="none"
          color="#dcddde"
          lineHeight="22px"
          fontWeight={400}
        >
          {typing ? (
            <Typist
              onTypingDone={async () => {
                setChats([
                  ...chats,
                  {
                    content: typing.content,
                    avatarUrl:
                      typing.avatarUrl ??
                      (user ? Utils.getUserAvatar(user) : undefined),
                    username: typing.username ?? user?.tag?.split('#')[0]
                  }
                ])
                setTyping(undefined)
                if (typing.onDone) {
                  if (typing.waitAfter) await Utils.wait(typing.waitAfter)

                  typing.onDone()
                }
              }}
            >
              {typing.content}
            </Typist>
          ) : (
            'Message #general'
          )}
        </MotionText>
      </HStack>
    </MotionVStack>
  )
}
