const webpack = require('webpack')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

function useEsbuildMinify(config, options) {
  const terserIndex = config.optimization.minimizer.findIndex(
    (minimizer) => minimizer.constructor.name === 'TerserPlugin'
  )
  if (terserIndex > -1) {
    config.optimization.minimizer.splice(
      terserIndex,
      1,
      new ESBuildMinifyPlugin(options)
    )
  }
}

function useEsbuildLoader(config, options) {
  const esbuildLoader = { loader: 'esbuild-loader', options }
  config.module.rules = config.module.rules.map((rule) => {
    if (rule.test && rule.test.test('.js')) {
      // use
      if (rule.use) {
        // Array
        if (Array.isArray(rule.use)) {
          rule.use = rule.use.map((loader) => {
            if (
              typeOf(loader) === 'Object' &&
              loader.loader === 'next-babel-loader'
            ) {
              return esbuildLoader
            }
            return loader
          })
        } else if (
          typeOf(rule.use) === 'Object' &&
          rule.use.loader &&
          rule.use.loader === 'next-babel-loader'
        ) {
          // Object
          rule.use = esbuildLoader
        }
      }
      // loader
      if (rule.loader && rule.loader.loader === 'next-babel-loader') {
        rule.loader = esbuildLoader
      }
    }
    return rule
  })
}

function typeOf(o) {
  return Object.prototype.toString.call(o).slice(8, -1)
}

module.exports = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 5
  },
  async rewrites() {
    return [{ source: '/servers/:path*', destination: '/dashboard/:path*' }]
  },

  webpack(config, { isServer, dev }) {
    config.plugins.push(
      new webpack.ProvidePlugin({
        React: 'react'
      })
    )

    useEsbuildMinify(config, {
      css: true
    })

    useEsbuildLoader(config, {
      // Specify `tsx` if you're using TypeSCript
      loader: 'tsx',
      target: 'es2017'
    })
    return config
  }
}
