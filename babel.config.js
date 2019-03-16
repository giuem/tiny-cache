const presets = ["@babel/env", "@babel/preset-typescript"];

const plugins = [
  ["@babel/plugin-transform-template-literals", { loose: true }],
];

module.exports = { presets, plugins };
