const path = require('path');
const common = require('./webpack.common.js');
const config = require('./config');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = (env, argv) =>
  merge(common(env, argv), {
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    devServer: {
      contentBase: path.join(__dirname, '../dist'), // 从哪提供内容
      historyApiFallback: true, // 所有的路由请求都定向到根目录
      inline: true,
      overlay: {
        //当出现编译器错误或警告时，就在网页上显示一层黑色的背景层和错误信息
        errors: true
      },
      hotOnly: true,
      port: config.port,
      publicPath: config.publicPath,
      noInfo: false,
      // https:true,
      disableHostCheck: true, //  用于解决反向代理Host检察问题
      proxy: {
        '*': {
          target: 'http://roundtables.superboss.cc',
          secure: false,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify('development'), // 定义环境变量
      }),
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.less/,
          use: [
            {loader: 'style-loader'},
            {loader: 'css-loader'},
            {
              loader: 'less-loader',
              // options: {
              //   modifyVars: {
              //     'primary-color': '#37ACFE',
              //   },
              // },
            },
          ],
        },
        {
          test: /\.(js|jsx)$/,
          loader: require.resolve('babel-loader'),
          include: path.join(__dirname, '../src'),
        },
      ],
    },
  });
