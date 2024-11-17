import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^services$': '<rootDir>/src/services',
    '^schemas$': '<rootDir>/src/schemas',
    '^utils$': '<rootDir>/src/utils',
    '^endpoints$': '<rootDir>/src/endpoints',
    '^infrastructure$': '<rootDir>/src/infrastructure',
  },
};

export default config;
