const path = require('path')
const rootPath = path.resolve(__dirname, '..', '..')
const sharedWebpackConfig = require(path.resolve(rootPath, 'webpack.common.js'))

module.exports = function (env, argv) {
  const isProduction = argv.mode === 'production'
  const projectPath = __dirname
  const shared = sharedWebpackConfig({ isProduction, projectPath })
  return {
    ...shared
    // a way to overwrite the shared configs
    // e.g. overwrite the entry attribute
    // ...shared,
    // entry: {
    //   project: ['@babel/polyfill', '@js/index.js']
    // }
  }
}
