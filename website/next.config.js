module.exports = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5
  },
  async rewrites () {
    return [
      { source: '/invite:path*', destination: '/api/invite' },
      { source: '/servers/:path*', destination: '/dashboard/:path*' },
      { source: '/dashboard/', destination: '/dashboard/filter' }
    ]
  }
}
