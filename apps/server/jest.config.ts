export default {
  displayName: 'server',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/server',
  moduleNameMapper: {
    '@keshet/shared': '<rootDir>/../../libs/shared/src/index.ts',
  },
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: [
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '**/?(*.)+(e2e-spec|e2e-test).[tj]s?(x)',
  ],
};
