import { CensorBotIcon } from '@jpbbots/censorbot-components'
import { HStack, VStack, Text, Link, Flex } from '@chakra-ui/layout'

import { motion } from 'framer-motion'
import { MiddleWrap } from '~/MiddleWrap'
import { wLT } from '@/hooks/useScreenSize'

export interface FooterOptions {
  name: string
  copyrightYear: string
  companyName: string

  links: Array<{
    label: string
    children: Array<{
      label: string
      url?: string
      onClick?: React.MouseEventHandler<HTMLAnchorElement>
    }>
  }>
}

export const GenericFooter = (props: FooterOptions) => {
  const wrapping = wLT(1000)

  const infoText = (
    <VStack px="64px" textAlign="center" justifyContent="center">
      <Text color="lighter.20">
        © Copyright {props.copyrightYear} {props.companyName} - All rights
        reserved
      </Text>
      <Text color="lighter.60">
        Made with{' '}
        <motion.span
          whileTap={{ cursor: 'grabbing' }}
          style={{
            display: 'inline-block',
            cursor: 'grab',
            userSelect: 'none'
          }}
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
          <Text color="brand.100" as="span">
            ❤
          </Text>
        </motion.span>{' '}
        by JPBBerry
      </Text>
    </VStack>
  )

  return (
    <Flex
      w="full"
      align="center"
      justify="center"
      wrap="wrap"
      py="10vh"
      px="3vw"
      bg="darker.10"
      gridGap="10px"
    >
      <VStack textAlign="center" w={wrapping ? 'full' : undefined}>
        <HStack>
          <CensorBotIcon />
          <Text textStyle="heading.xl">{props.name}</Text>
        </HStack>
        {!wrapping && infoText}
      </VStack>

      <MiddleWrap w="half" spacing="25px">
        {props.links.map((cat) => (
          <VStack key={cat.label}>
            <Text color="lighter.60" textStyle="label.sm">
              {cat.label.toUpperCase()}
            </Text>
            {cat.children.map((link) => (
              <Link
                target="_blank"
                href={link.url}
                onClick={link.onClick}
                key={link.label}
                color="lighter.40"
                cursor="pointer"
                _hover={{
                  color: 'lighter.60',
                  transition: '0.2s'
                }}
              >
                {link.label}
              </Link>
            ))}
          </VStack>
        ))}
      </MiddleWrap>
      {wrapping && infoText}
    </Flex>
  )
}
