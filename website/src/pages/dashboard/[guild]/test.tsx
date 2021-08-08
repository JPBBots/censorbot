import React from 'react'
import { Setting } from '~/settings/Setting'
import { settings } from '../../../components/settings/settings'

import { VStack } from '@chakra-ui/react'

export default function Test () {
  return <VStack spacing={2}>
    {settings.map(x =>
      <Setting key={x.title} {...x} />
    )}
  </VStack>
}
