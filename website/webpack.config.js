const path = require('path');
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  devtool: "source-map",
  entry: './build/tsc/index.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'static')
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
};