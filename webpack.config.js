var webpack = require("webpack");

module.exports = {
  entry: './index.js',
  target: 'node',
  plugins: [
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new webpack.IgnorePlugin(/vertx/)
  ],
  module: {
    loaders: [
      { test: /\.json$/, loader: "json-loader" },
      {
        test: /\.js$/,
        exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015']
      }
    } ]
  }
};
