const fs = require('fs')
const path = require('path')

const links = fs.readdirSync(path.resolve(__dirname, './src/pages/api')).filter(x => x.endsWith('.tsx')).map(x => x.split('.')[0])

module.exports = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5
  },
  async rewrites () {
    return [
      ...links.map(name => ({
        source: `/${name}:path*`, destination: `/api/${name}`
      })),
      { source: '/servers/:path*', destination: '/dashboard/:path*' }
    ]
  }
}
