const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = {}) => {
  const envFile = env.ENV_FILE || process.env.ENV_FILE || '.env';
  console.log(`[webpack.dev] Using env file: ${envFile}`);

  return {
    entry: './src/main.js',
    mode: 'development',
    devtool: 'eval-source-map',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'ameya-chatbot-dev.js',
    },
    devServer: {
      static: path.resolve(__dirname, 'public'),
      port: 3007,
      open: true,
      hot: true,
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
        },
      ],
    },
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, envFile),
      }),
      new HtmlWebpackPlugin({
        template: './public/dev.html',
        inject: true,
      }),
    ],
  };
};
