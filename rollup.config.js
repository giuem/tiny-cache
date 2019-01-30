import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";

import pkg from "./package.json";

const extensions = [".js", ".jsx", ".ts", ".tsx"];
const name = "TinyCache";

const plugins = [
  resolve({ extensions }),

  commonjs({
    include: "node_modules/**",
    extensions: [".js", ".ts"],
    ignoreGlobal: false,
    sourceMap: false
  }),

  babel({ extensions, include: ["src/**/*"] })
];

const CommonConfig = {
  input: "src/index.ts",
  plugins
};

const BrowserConfig = {
  ...CommonConfig,
  output: {
    file: pkg.browser,
    format: "iife",
    name,
    globals: {}
  }
};

const BrowserMinConfig = {
  ...CommonConfig,
  plugins: [...plugins, uglify()],
  output: {
    file: pkg.browser.replace(".js", ".min.js"),
    format: "iife",
    name,
    globals: {}
  }
};

const CommonjsConfig = {
  ...CommonConfig,
  output: {
    file: pkg.main,
    format: "cjs"
  }
};

const ESMConfig = {
  ...CommonConfig,
  output: {
    file: pkg.module,
    format: "esm"
  }
};

export default [BrowserConfig, BrowserMinConfig, CommonjsConfig, ESMConfig];
