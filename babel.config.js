const presets = ["@babel/env", "@babel/preset-typescript"];

const plugins = [
  ["@babel/proposal-class-properties", { loose: true }],
  "@babel/proposal-object-rest-spread",
  ["@babel/plugin-transform-template-literals", { loose: true }],
  ["@babel/plugin-transform-classes", { loose: true }]
];

module.exports = { presets, plugins };
