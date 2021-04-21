const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: path.resolve(__dirname, './src/index.ts'),
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts'],
    alias: {
      "@typings": path.resolve(__dirname, '../typings')
    }
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 4,
          sourceMap: true,
          mangle: {
            module: true,
            toplevel: true
          },
          compress: {
            defaults: true,
            arguments: true,
            hoist_props: true,
            keep_fargs: false,
            unsafe: true
          }
        }
      })
    ]
  }
}
