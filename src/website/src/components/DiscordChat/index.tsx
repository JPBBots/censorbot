import { Box, HStack, VStack, Text, StackProps } from '@chakra-ui/layout'
import { Image } from '@chakra-ui/react'
import { hex } from 'chroma-js'
import Typist from 'react-typist'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { MotionHStack, MotionText, MotionVStack } from '~/motion'
import BRANDING from '@/BRANDING'
import { Utils } from '@/utils/Utils'
import { useUser } from '@/hooks/useAuth'

const discordBg = hex('#36393f')
const chatInputBg = hex('#40444B')
const attachmentButton = hex('#B9BBBE')

const font = 'Whitney,"Helvetica Neue",Helvetica,Arial,sans-serif'

interface DiscordMessageProps {
  content: any
  badge?: string
  avatarUrl?: string
  username?: string
}

export function DiscordMessage({
  content,
  badge,
  ...opts
}: DiscordMessageProps) {
  const { user } = useUser(false)

  const avatarUrl =
    opts.avatarUrl ||
    (user && Utils.getUserAvatar(user)) ||
    'https://cdn.discordapp.com/embed/avatars/1.png'

  const username = opts.username || (user && user.tag.split('#')[0]) || 'User'

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
        <HStack>
          <Text
            fontSize="1rem"
            fontWeight={500}
            lineHeight="1.375rem"
            fontFamily={font}
            color="white"
          >
            {username}
          </Text>
          {badge && (
            <Text
              bg="#5865F2"
              px="2"
              textStyle="label.sm"
              fontSize="12px"
              borderRadius="lg"
            >
              {badge}
            </Text>
          )}
        </HStack>
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

export function CensorBotEmbed() {
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
        p="12px 16px 12px 12px"
        bg="#2f3136"
      >
        You're not allowed to say that...
      </Box>
    </Box>
  )
}

interface TypingSettings extends DiscordMessageProps {
  waitAfter?: number
  waitSend?: number
  onDone?: () => void
}

interface DiscordChatOrchestraCtx {
  setTyping: (data: Omit<TypingSettings, 'onDone'>) => Promise<void>
  setChats: Dispatch<SetStateAction<DiscordMessageProps[]>>
  clearChats: () => void
  loop: () => void
  data: any
}

type DiscordChatOrchestra = (ctx: DiscordChatOrchestraCtx) => void

export interface DiscordChatProps extends StackProps {
  orchestra: DiscordChatOrchestra
}

export function DiscordChat({ orchestra, ...props }: DiscordChatProps) {
  const [chats, setChats] = useState<DiscordMessageProps[]>([])
  const [typing, setTyping] = useState<TypingSettings>()

  const doneTyping = async () => {
    if (!typing) return

    setChats([
      ...chats,
      {
        content: typing.content,
        avatarUrl: typing.avatarUrl,
        username: typing.username,
        badge: typing.badge
      }
    ])
    setTyping(undefined)
    if (typing.onDone) {
      if (typing.waitAfter) await Utils.wait(typing.waitAfter)

      typing.onDone()
    }
  }

  const run = (context: DiscordChatOrchestraCtx) => {
    orchestra(context)
  }

  useEffect(() => {
    let done = false
    const context: DiscordChatOrchestraCtx = {
      setTyping: (data) => {
        return new Promise((resolve) => {
          const promiseData = {
            ...data,
            onDone: () => resolve()
          }

          setTyping(promiseData)
        })
      },
      setChats,
      clearChats: () => {
        setChats([])
      },
      loop: () => {
        if (done) return

        run(context)
      },
      data: undefined
    }
    run(context)

    return () => {
      done = true
    }
  }, [])

  useEffect(() => {
    if (typing && typeof typing?.content !== 'string') {
      setTimeout(() => {
        doneTyping()
      }, typing.waitSend!)
    }
  }, [typing])

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
          alignSelf="flex-end"
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
            typeof typing.content === 'string' ? (
              <Typist onTypingDone={doneTyping}>{typing.content}</Typist>
            ) : (
              typing.content
            )
          ) : (
            'Message #general'
          )}
        </MotionText>
      </HStack>
    </MotionVStack>
  )
}
