import styles from './LandingExample.module.scss'

export function LandingExample (props: { href?: string, example: string, align: 'left' | 'right' }) {
  return (
    <div className={styles.example}>
      <a href={props.href} target="_blank">
        <img src={props.example}></img>
      </a> <br />
      <small style={{
        marginTop: '50px',
        float: props.align
      }}>The word "test" has been censored for this example.</small>
    </div>
  )
}
