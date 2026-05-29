// webpack.config.js
const path = require('path');
const Dotenv = require('dotenv-webpack');
const { version } = require('./package.json');

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `ameya-chatbot-v${version}.js`,
    library: 'AmeyaChatbot',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
      }
    ],
  },
  plugins: [
    new Dotenv({
      path: process.env.ENV_FILE ? path.resolve(__dirname, process.env.ENV_FILE) : path.resolve(__dirname, '.env'),
    }),],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
};
