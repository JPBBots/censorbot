module.exports = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5
  },
  async rewrites() {
    return [
      { source: '/servers/:path*', destination: '/dashboard/:path*' }
    ]
  },
  experimental: {
    externalDir: true
  }
}
