/* eslint-disable */
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const common = require('./webpack.common.js');
const config = require('./config');
const HappyPack = require('happypack'); //多线程运行
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = (env, argv) =>
  merge(common(env, argv), {
    mode: 'production',
    devtool: 'cheap-source-map',
    module: {
      rules: [
        {
          test: /\.css$/,
          // include: config.srcPath, // 需要解析ant的css 所以注释掉了
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.less/,
          use: [
            MiniCssExtractPlugin.loader,
            {loader: 'css-loader'},
            {
              loader: 'less-loader',
              options: {
                modifyVars: {
                  'primary-color': '#37ACFE',
                },
                javascriptEnabled: true,
              },
            },
          ],
        },
        {
          test: /\.(js|jsx)$/,
          loader: 'happypack/loader?id=babel',
          // loader: 'babel-loader?cacheDirectory=true',// babel缓存开启 极大提高打包速度
          include: path.join(__dirname, '/../src'),
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new BundleAnalyzerPlugin(), // 打包后显示打包文件细节
      new webpack.DefinePlugin({
        NODE_ENV: JSON.stringify('production'), // 定义环境变量
      }),
      new HappyPack({
        //多线程运行 默认是电脑核数-1
        id: 'babel', //对于loaders id
        loaders: ['babel-loader'], //是用babel-loader解析
        threadPool: HappyPack.ThreadPool({size: 4}),
        verboseWhenProfiling: true, //显示信息
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].chunk.css',
      }),
      new AddAssetHtmlWebpackPlugin({
        //将dll文件引入html
        filepath: path.resolve(__dirname, '../dll/pc/vendor.dll.js'),
      }),
      new webpack.DllReferencePlugin({
        //webpack打包时根据manifest.json文件,排除不需要打包处理的第三方依赖文件
        manifest: path.resolve(__dirname, '../dll/pc/manifest.json'),
      }),
    ],

    optimization: {
      usedExports: true, // tree shaking  package.json中也做了css排除配置
      splitChunks: {
        chunks: 'all',
        minSize: 30000, // 3 to 10 because of gzip
        minChunks: 2, // 共享该module的最小chunk数
        maxAsyncRequests: 10,
        maxInitialRequests: 3,
        automaticNameDelimiter: '-',
        name: true,
      },
      minimizer: [
        new UglifyJsPlugin({
          sourceMap: false,
          parallel: true,
          cache: true,
          uglifyOptions: {
            output: {
              comments: false,
              beautify: false,
            },
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
          },
          exclude: /(node_modules|bower_components)/,
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
    },
  });
