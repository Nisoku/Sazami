module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/jest-setup.js"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        target: "ES2020",
        module: "CommonJS",
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        moduleResolution: "node16",
        isolatedModules: true,
      },
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    "^.*icons/index.*$": "<rootDir>/tests/__mocks__/icons.js",
  },
};
