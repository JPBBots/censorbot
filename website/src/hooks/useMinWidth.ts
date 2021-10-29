import React, { useState } from 'react'
import { useWindowSize } from 'react-use'

export const useMinWidth = (width: number) => {
  const windowDimensions = useWindowSize(1, 1)
  const [meetsWidth, setMeetsWidth] = useState(false)

  React.useEffect(() => {
    setMeetsWidth(windowDimensions.width < width)
  }, [windowDimensions.width])

  return [meetsWidth]
}
