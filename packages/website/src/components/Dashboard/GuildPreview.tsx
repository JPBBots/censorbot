import { Avatar, AvatarProps, StackProps, VStack, Text } from '@chakra-ui/react'

const GUILD_ICON_SIZE = '128px'

export interface GuildPreviewGuildType {
  name: string
  iconUrl?: string
}

export interface GuildPreviewProps extends StackProps {
  guild: GuildPreviewGuildType
  iconSize?: AvatarProps['boxSize']
}

export const GuildPreview = ({
  guild,
  iconSize = GUILD_ICON_SIZE,
  ...stackProps
}: GuildPreviewProps) => (
  <VStack
    p={4}
    spacing={4}
    rounded="lg"
    align="center"
    bg="lighter.5"
    cursor="pointer"
    transition="background .12s ease"
    _hover={{
      bg: 'lighter.10'
    }}
    {...stackProps}
  >
    <Avatar
      rounded="md"
      bg="lighter.5"
      fontSize="36px"
      fontWeight="500"
      name={guild.name}
      boxSize={iconSize}
      src={guild.iconUrl}
      color="lighter.100"
      sx={{
        img: {
          rounded: 'md'
        }
      }}
    />
    <Text
      noOfLines={1}
      align="center"
      textStyle="label.md"
      maxW={GUILD_ICON_SIZE}
    >
      {guild.name}
    </Text>
  </VStack>
)
