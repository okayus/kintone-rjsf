/* eslint-disable no-undef */
const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");

const KintonePlugin = require("@kintone/webpack-plugin-kintone-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const packageJson = require("./package.json");

const pluginName = packageJson.name;

// https://webpack.js.org/configuration/mode/#mode-none
module.exports = (env, arg) => {
  return {
    entry: {
      desktop: "./src/ts/desktop/index.tsx",
      config: "./src/ts/config/config.tsx",
    },
    output: {
      path: path.resolve(__dirname, "plugin", "js"),
      filename: `${pluginName}-[name].js`,
    },
    plugins: [
      new KintonePlugin({
        manifestJSONPath: "./plugin/manifest.json",
        privateKeyPath: "./private.ppk",
        pluginZipPath: "./dist/plugin.zip",
      }),
    ],
    target: ["web", "es6"],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
                plugins: ["@babel/plugin-transform-runtime"],
                cacheDirectory: true,
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
      plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
    },
    devtool: arg.mode === "development" ? "inline-source-map" : false,
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
  };
};
