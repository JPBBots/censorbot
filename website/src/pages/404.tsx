import { MainButton } from '~/button/MainButton'

export default function Custom404 () {
  return (
    <div style={{
      textAlign: 'center'
    }}>
      <h1>Page not found.</h1>
      <br />
      <MainButton href="/">Go back Home</MainButton>
    </div>
  )
}
