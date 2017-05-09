const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './handler.js',
  target: 'node',
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: __dirname,
      exclude: [/node_modules/, '/__tests__/'],
    }, {
      test: /\.json$/,
      loaders: ["json-loader"],
      include: __dirname,
      exclude: [/node_modules/, '/__tests__/'],
    }]
  },
  externals: [
    nodeExternals(), {
      'aws-sdk': 'aws-sdk'
    }
  ]
};