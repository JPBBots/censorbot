import React from 'react'

import BRANDING from 'BRANDING'

// import Example1 from '../images/JsEzHiZkM4.png'

import styles from './index.module.scss'

import { MainButton } from '~/button/MainButton'
import { LandingSection } from '~/landing/LandingSection'

import Aos from 'aos'
import 'aos/dist/aos.css'
import { MidContainer } from '~/styling/MidContainer'

export default function Landing () {
  React.useEffect(() => {
    Aos.init({ duration: 400 })
  })
  return (
    <MidContainer>
      <div className={styles.main}>
        <div className={styles.left}>
          <h1>{BRANDING.title}</h1>
          <h3>{BRANDING.title2}</h3>
          <MainButton href="/dashboard">
            Get Started
          </MainButton>
          <small>Used in more than {(50000).toLocaleString()} servers!</small>
        </div>

        {/* <LandingExample href="/invite" example="https://static.jpbbots.org/cheesetouch_example1.gif" align='right' /> */}
        <img src={BRANDING.logo}></img>
      </div>
      <div>
        {
          BRANDING.examples.map((x, ind) => <>
            <LandingSection ind={ind} key={ind} href="/" example={x.example} title={x.title} align={(ind % 2) ? 'right' : 'left'}>
              {x.description}
            </LandingSection>
            <div style={{
              height: '50px'
            }}></div>
          </>)
        }

        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </div>
    </MidContainer>
  )
}
