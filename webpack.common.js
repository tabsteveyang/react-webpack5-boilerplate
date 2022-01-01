const webpack = require('webpack')
const path = require('path')
const rootPath = __dirname
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = function ({ isProduction, projectPath }) {
  if (isProduction === undefined || isProduction === null || !projectPath) {
    throw new Error('invalid arguments: isProduction and projectPath should not be empty.')
  }
  return {
    entry: {
      project: ['@babel/polyfill', '@common/src/js/modules/polyfill.js', '@js/index.js']
    },
    output: {
      path: path.resolve(projectPath, 'build'),
      filename: isProduction ? 'js/bundle.[chunkhash].js' : 'js/bundle.js',
      chunkFilename: isProduction ? 'js/chunks/[id].[chunkhash:7].js' : 'js/chunks/[name].js' // chunk files will place under <output_paht>/js/chunk/ if dynamic import is implemented
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.(sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,  // always extract the css files no matter if isProduction is true or not
            'css-loader',
            'postcss-loader', // autoprefix
            'sass-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          type: 'asset',  // parse these extension by webpack5 Asset Module
          generator: {
            filename: './img/[hash:7][ext]',
            publicPath: (pathData, assetInfo) => {
              // make the image files can be referenced correctly by relative paths in scss
              return pathData.module.rawRequest.indexOf('/css/') > -1 ? '.' : ''
            }
          },
          parser: {
            dataUrlCondition: {
              maxSize: 1024 // 1kb
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],  // https://webpack.js.org/configuration/resolve/#resolveextensions
      // declaring alias for reducing the use of relative path
      alias: {
        '@js': path.resolve(projectPath, 'src/js/'),
        '@scss': path.resolve(projectPath, 'src/scss/'),
        '@img': path.resolve(rootPath, 'common/img/'),
        '@common': path.resolve(rootPath, 'common/'),
        // alias to projects
        '@project1': path.resolve(rootPath, 'projects/project1/src/js/'),
        '@project2': path.resolve(rootPath, 'projects/project2/src/js/')
      }
    },
    plugins: [
      // extract the CSS into files
      new MiniCssExtractPlugin({
        filename: isProduction ? 'css/index.[chunkhash].css' : 'css/index.css',
        experimentalUseImportModule: false
      }),
      // import the module automatically
      new webpack.ProvidePlugin({
        React: 'react',
        ReactDom: 'react-dom',
        PropTypes: 'prop-types'
      }),
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
        cleanOnceBeforeBuildPatterns: ['**/js/*', '!**/js/lib/**', '**/css/*', '!**/css/lib/**']
      }),
      // send values as golbal variables from the webpack
      new webpack.DefinePlugin({
        PRODUCTION: isProduction
      }),
      // rules for building index.html from the template
      new HtmlWebpackPlugin({
        alwaysWriteToDisk: true,
        template: 'src/template/index.html',
        filename: 'index.html',
        minify: false,
        templateParameters: {
          htmlWebpackPlugin: {
            // sending specific values into the template
            foo: 'bar'  // you can get the value by using <%= htmlWebpackPlugin.foo %> in the template file
          }
        }
      })
    ],
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    devServer: {
      // logging: 'error',
      server: 'https',
      port: 8080,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.resolve(projectPath, 'build')
      },
      devMiddleware: {
        writeToDisk: (filePath) => {
          return !/.*\.hot-update\..*/.test(filePath) // stop devServer from write temp files to disk
        }
      }
    }
  }
}
