import React from 'react'

import BRANDING from 'BRANDING'

import Example1 from '../images/example1.gif'

import styles from './index.module.scss'

import { MainButton } from '~/button/MainButton'

import { LandingExample } from '~/landing/LandingExample'
import { LandingSection } from '~/landing/LandingSection'

export default function Landing () {
  return (
    <>
      <div className={styles.main}>
        <div className={styles.left}>
          <h1>{BRANDING.title}</h1>
          <h3>{BRANDING.title2}</h3>
          <MainButton href="/dashboard">
            Get Started
          </MainButton>
          <small>Used in more than {(50000).toLocaleString()} servers!</small>
        </div>

        <LandingExample href="/invite" example={Example1.src} align='right' />
      </div>
      <div>
        {
          BRANDING.examples.map((x, ind) => <LandingSection key={ind} href="/" example={x.example} title={x.title} align={(ind % 2) ? 'right' : 'left'}>
            {x.description}
          </LandingSection>)
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
    </>
  )
}
