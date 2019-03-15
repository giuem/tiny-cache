import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { uglify } from "rollup-plugin-uglify";
import { noMutate as assign } from "object-assign-deep";

import pkg from "./package.json";

const extensions = [".js", ".jsx", ".ts", ".tsx"];
const name = "TinyCache";

const isProduction = process.env.NODE_ENV === "production";

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

const BrowserConfig = assign(CommonConfig, {
  // input: "src/index.browser.ts",
  output: {
    file: pkg.browser,
    format: "iife",
    name,
    globals: {}
  }
});

const BrowserMinConfig = assign(BrowserConfig, {
  plugins: [...plugins, uglify({ sourcemap: false })],
  output: {
    file: pkg.browser.replace(".js", ".min.js")
  }
});

const CommonjsConfig = assign(CommonConfig, {
  output: {
    file: pkg.main,
    format: "cjs"
  }
});

const ESMConfig = assign(CommonConfig, {
  output: {
    file: pkg.module,
    format: "esm"
  }
});

export default () => {
  if (isProduction) {
    return [BrowserConfig, BrowserMinConfig, CommonjsConfig, ESMConfig];
  } else {
    return (async () => {
      return assign(BrowserConfig, {
        plugins: [
          ...plugins,
          (await import("rollup-plugin-serve"))({
            open: true,
            contentBase: ["dist", "e2e"]
          })
        ],
        watch: {
          clearScreen: true,
          include: ["src/**", "e2e/**"]
        }
      });
    })();
  }
};
