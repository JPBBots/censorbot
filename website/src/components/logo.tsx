import BRANDING from 'BRANDING'

export function Logo (props: JSX.IntrinsicElements['img']) {
  return (
    <img src={BRANDING.logo} {...props}></img>
  )
}
