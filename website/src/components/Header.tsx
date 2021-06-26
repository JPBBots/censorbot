import BRANDING from 'BRANDING'
import Head from 'next/head'

export function Header () {
  return (
    <Head>
      <link rel="icon" href={BRANDING.logo} />
      <meta name="viewport"
        content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0" />
      <title>Censor Bot</title>

      <meta property="og:image" content={BRANDING.logo} />
      <meta name="theme-color" content="#ea5455" />
      <meta property="og:title" content={BRANDING.name} />
      <meta property="og:description" content="Easy to use advanced content filtering for your Discord server(s)!" />
      <meta name="description"
        content="Advanced Anti-Swear Bot that comes with a pre-built filters, no work needed! anti swear bot" />
    </Head>
  )
}
