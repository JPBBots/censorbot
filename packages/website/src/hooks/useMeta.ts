import { ServerSideProps } from '@/../../typings'
import { useEffect, useState } from 'react'

export const useMeta = () => {
  const [props, setProps] = useState<ServerSideProps>({
    serverCount: 1,
    trialLength: 1
  })

  useEffect(() => {
    fetch('/api/props')
      .then((x) => x.json())
      .then((props) => setProps(props))
  }, [])

  return props
}
