export function Setting (props: { title: string, description: string, children: JSX.Element, premium?: boolean}) {
  return (
    <div>
      <h3>{props.title}{props.premium ? '(Premium)' : ''}</h3>
      <h4>{props.description}</h4>
      <div>
        {props.children}
      </div>
    </div>
  )
}
