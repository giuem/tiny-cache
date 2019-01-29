import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const extensions = [".js", ".jsx", ".ts", ".tsx"];
const name = "TinyCache";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export default {
  input: "src/index.ts",
  plugins: [
    resolve({ extensions }),

    commonjs({
      include: "node_modules/**",

      extensions: [".js", ".ts"],

      ignoreGlobal: false,

      sourceMap: false
    }),

    babel({ extensions, include: ["src/**/*"] }),

    isProduction && terser()
  ],

  output: [
    // {
    //   file: pkg.main,
    //   format: "cjs"
    // },
    {
      file: pkg.module,
      format: "es"
    },
    {
      file: pkg.browser,
      format: "iife",
      name,
      globals: {}
    }
  ]
};
