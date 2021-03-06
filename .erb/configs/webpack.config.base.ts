/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
// import NodePolyFillPlugin from 'node-polyfill-webpack-plugin';
import { dependencies as externals } from '../../release/app/package.json';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.[jt]sx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx', // Or 'ts' if you don't need tsx
          target: 'esnext',
        },
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
      },
      {
        test: /\.node$/,
        use: {
          loader: 'node-loader',
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    alias: {
      process: 'process/browser.js',
    },
    fallback: {},
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new webpack.ProvidePlugin({
      React: 'react',
      ReactDOM: 'react-dom',
    }),
  ],
};

export default configuration;
