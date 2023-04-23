import { StackProps, VStack, Text, HStack } from '@chakra-ui/layout'
import { Icon } from '@chakra-ui/icon'
import { Button } from '@chakra-ui/button'
import { FaCrown } from 'react-icons/fa'

const CARD_WIDTH = '240px'

export interface PremiumCardProps extends StackProps {
  title: string
  perks: string[]
  monthlyPrice: number
  onBuy?(): void
}

export const PremiumCard = ({
  title,
  perks,
  monthlyPrice,
  onBuy = () => {},
  w = CARD_WIDTH,
  ...stackProps
}: PremiumCardProps) => (
  <VStack
    p={4}
    w={w}
    maxW={w}
    rounded="lg"
    bg="darker.20"
    align="center"
    justify="space-between"
    flexGrow={1}
    {...stackProps}
  >
    <VStack w="full" spacing={4}>
      <VStack w="full" spacing={1} align="center">
        <Text textStyle="heading.sm" color="lighter.100">
          {title}
        </Text>
        <Text textStyle="label.md" color="brand.100">
          ${monthlyPrice}/month
        </Text>
      </VStack>
      <VStack w="full" align="start" spacing={4}>
        {perks.map((perk, i) => (
          <HStack
            key={i + perk}
            w="full"
            spacing={4}
            align="center"
            justify="start"
          >
            <Icon as={FaCrown} color="brand.100" boxSize={4} />
            <Text textStyle="default" color="lighter.100">
              {perk}
            </Text>
          </HStack>
        ))}
      </VStack>
    </VStack>
    <Button w="full" size="md" variant="primary" onClick={onBuy}>
      Buy
    </Button>
  </VStack>
)
