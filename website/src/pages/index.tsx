import React from 'react'

import BRANDING from 'BRANDING'

// import Example1 from '../images/JsEzHiZkM4.png'

import styles from './index.module.scss'

import { MainButton } from '~/button/MainButton'
import { LandingSection } from '~/landing/LandingSection'

import Aos from 'aos'
import 'aos/dist/aos.css'
import { MidContainer } from '~/styling/MidContainer'
import { LandingExample } from '~/landing/LandingExample'

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

        <LandingExample href="/invite" example={BRANDING.mainImage} align='right' />
      </div>
      <div>
        {
          BRANDING.examples.map((x, ind) => <div key={ind}>
            <LandingSection ind={ind} href="/" example={x.example} title={x.title} align={(ind % 2) ? 'right' : 'left'}>
              {x.description}
            </LandingSection>
            <div style={{
              height: '50px'
            }}></div>
          </div>)
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
