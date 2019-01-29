module.exports = {
  collectCoverage: true,
  // collectCoverageFrom: ["src/**/*.ts"],
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom-thirteen",
  testEnvironmentOptions: {
    resources: "usable",
    runScripts: "dangerously"
  },
  testMatch: ["**/__tests__/*.ts"],
  setupFiles: ["jest-date-mock"]
};
