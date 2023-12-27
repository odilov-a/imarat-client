const path = require("path");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "node",
  entry: "./server.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ejs$/,
        loader: "ejs-compiled-loader",
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "views",
          to: "views",
        },
      ],
    }),
  ],
};
