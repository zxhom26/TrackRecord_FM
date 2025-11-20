module.exports = {
  rootDir: ".",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest", // replace babel-jest
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testMatch: ["<rootDir>/app/_tests_/**/*.test.js"], // adjust for .ts if needed
};
