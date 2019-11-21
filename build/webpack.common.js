const path = require('path');
const config = require('./config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtendedDefinePlugin = require('extended-define-webpack-plugin'); //全局变量
module.exports = (env, argv) => {
  const NODE_ENV = env.NODE_ENV;
  console.log(env);
  return {
    entry: {
      app: './src/index.js',
    },
    output: {
      filename: 'app.js', // 出口文件名称
      path: path.join(__dirname, '../dist/'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, '../public/index.html'), //样板
        inject: 'body', //注入到哪里
        chunksSortMode: 'none',
        hash: true,
      }),
      new ExtendedDefinePlugin({__LOCAL__: NODE_ENV === 'development'}), //全局变量
    ],
    resolve: {
      extensions: ['.js','.jsx','.ts', '.tsx' ],
      alias: {
        // 引入模块别名
        src: `${config.srcPath}`,
        page:`${config.srcPath}/page`
      },
    },
    module: {
      rules: [
        {
          test:/\.(ts|tsx)?$/,
          exclude: /node_modules/,
          include: config.srcPath,
          use: ['ts-loader'],
        },
        {
          test: /\.(png|jpg|gif|woff|woff2)$/,
          include: config.srcPath,
          loader: 'url-loader?limit=8192&name=images/[hash:8].[name].[ext]',
          exclude: /node_modules/,
        },
        {
          test: /\.(ttf|eot|mp4|ogg|svg)$/,
          include: config.srcPath,
          loader: 'file-loader',
          exclude: /node_modules/,
        }
      ],
    },
  };
};
