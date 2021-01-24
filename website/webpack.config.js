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
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts' ],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
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
