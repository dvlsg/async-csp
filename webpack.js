var webpack = require('webpack');
var path    = require('path');

module.exports = {
  context: path.join(__dirname),
  entry: ["babel-polyfill", "./src/channel.js"],
  output: {
      path: path.join(__dirname, './dist'),
      filename: "async-csp.js",
      libraryTarget: 'umd',
      library: 'async-csp'
  },
	module: {
	  loaders: [
	    { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
	  ]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin()
	]
}
