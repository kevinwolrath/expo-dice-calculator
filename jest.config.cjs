module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/db$": "<rootDir>/db",
    "^@/db/(.*)$": "<rootDir>/db/$1",
    "^@/stores/(.*)$": "<rootDir>/app/stores/$1",
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(jpg|jpeg|png)$": "<rootDir>/tests/__mocks__/fileMock.js",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
};
