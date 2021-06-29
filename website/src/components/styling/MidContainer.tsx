import { PropsWithChildren } from 'react'

export function MidContainer (props: PropsWithChildren<{}>) {
  return (
    <div style={{
      margin: '2vh 10vw'
    }}>
      {props.children}
    </div>
  )
}
