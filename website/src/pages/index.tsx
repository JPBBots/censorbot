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
import Router from 'next/router'

const mobileWidth = 820

function getWindowDimensions () {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height
  }
}

export default function Landing (props: JSX.Element) {
  const [windowDimensions, setWindowDimensions] = React.useState<{ width: number, height: number }>()

  React.useEffect(() => {
    Aos.init({ duration: 400 })
    void Router.prefetch('/dashboard')
    setWindowDimensions(getWindowDimensions())
    function handleResize () {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const mobiled = windowDimensions ? windowDimensions.width < mobileWidth : false

  return (
    <MidContainer>
      <div data-aos="zoom-in" className={styles.main}>
        <div className={styles.left}>
          <h1>{BRANDING.title}</h1>
          <h3>{BRANDING.title2}</h3>
          <MainButton href="/dashboard">
            Get Started
          </MainButton>
          <small>Used in more than {(50000).toLocaleString()} servers!</small>
        </div>

        { !mobiled ? <LandingExample href="/invite" example={BRANDING.mainImage} align='right' mobiled={false} /> : '' }
      </div>
      <div>
        {
          BRANDING.examples.map((x, ind) => <div key={ind}>
            <LandingSection ind={ind} href="/" example={x.example} title={x.title} align={(ind % 2) ? 'right' : 'left'} mobiled={mobiled}>
              {x.description}
            </LandingSection>
            <div style={{
              height: '50px'
            }}></div>
          </div>)
        }

        <br />
        <br />
      </div>
      <div>
        <div data-aos="zoom-in" data-aos-anchor-placement="top-bottom" style={{
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '3rem',
            margin: '20px 0px 10px 0px'
          }}>Are you ready to go?</h1>
          <h2>Let's start cleaning your server!</h2> <br />
          <MainButton href="/invite" target="_blank">Invite</MainButton>
        </div>
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
        <br />
        <br />
      </div>
    </MidContainer>
  )
}
