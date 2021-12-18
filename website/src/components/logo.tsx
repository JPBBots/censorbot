import BRANDING from 'BRANDING'

export function Logo(props: JSX.IntrinsicElements['img']) {
  return <img draggable="false" src={BRANDING.logo} {...props}></img>
}
