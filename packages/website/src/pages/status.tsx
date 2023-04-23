import useSWR from 'swr'

import { Root } from '~/Root'

import { MiddleWrap } from '@jpbbots/theme'

import { Divider, Text, VStack, HStack, Box } from '@chakra-ui/layout'
import { Tooltip } from '@chakra-ui/tooltip'

import type { ClusterStats } from 'jadl'

enum State {
  DISCONNECTED = 0,
  CONNECTING = 1,
  CONNECTED = 2
}

export default function Status() {
  const { data } = useSWR<ClusterStats[]>(
    '/api/status',
    async (url) => await fetch(url).then(async (res) => await res.json())
  )

  return (
    <Root pt="10px">
      {data?.map((stat) => (
        <VStack px="16px" key={stat.cluster.id} w="full" align="flex-start">
          <Text textStyle="heading.xl">Cluster {stat.cluster.id}</Text>
          <Divider color="lighter.5" />
          <MiddleWrap spacing="10px">
            {stat.shards.map((shard) => (
              <VStack
                key={shard.id}
                bg="darker.10"
                p="10px"
                borderRadius="md"
                w="205px"
                spacing="5px"
              >
                <HStack spacing="15px">
                  <Tooltip
                    hasArrow
                    bg="black"
                    opacity={100}
                    p={2}
                    borderRadius="md"
                    label={
                      {
                        [State.DISCONNECTED]: 'Disconnected',
                        [State.CONNECTING]: 'Connecting',
                        [State.CONNECTED]: 'Connected'
                      }[shard.state]
                    }
                  >
                    <Box
                      bg={
                        {
                          [State.DISCONNECTED]: 'red',
                          [State.CONNECTING]: 'yellow',
                          [State.CONNECTED]: 'green'
                        }[shard.state]
                      }
                      w="20px"
                      h="20px"
                      borderRadius="999px"
                    />
                  </Tooltip>
                  <Text textStyle="heading.sm">Shard {shard.id}</Text>
                </HStack>
                <Text>{shard.guilds.toLocaleString()} servers</Text>
                <Text>{shard.ping}ms ping</Text>
              </VStack>
            ))}
          </MiddleWrap>
        </VStack>
      ))}
    </Root>
  )
}
