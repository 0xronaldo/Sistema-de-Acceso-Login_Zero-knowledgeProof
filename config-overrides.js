const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Add polyfills for Web3 and crypto libraries
  config.resolve = {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: false,
      http: false,
      https: false,
      os: false,
      url: false,
      zlib: false,
      path: false,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      'openapi-fetch': path.resolve(__dirname, 'src/mocks/openapi-fetch.js'),
    },
    alias: {
      ...config.resolve.alias,
      'openapi-fetch': path.resolve(__dirname, 'src/mocks/openapi-fetch.js'),
    }
  };

  // Add plugins for global polyfills
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      global: 'globalThis',
    }),
  ];

  // Add module rules to handle imports
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,
    },
  });

  // Ignore source map warnings for external packages
  config.module.rules.push({
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
    exclude: [
      /node_modules\/@reown/,
      /node_modules\/@metamask/,
      /node_modules\/superstruct/,
      /node_modules\/openapi-fetch/,
    ],
  });

  return config;
};