// jest.config.js

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  moduleNameMapper: {
    '^.+\\.(css|less|sass|scss)$': 'identity-obj-proxy',

    // ✅ ВИПРАВЛЕННЯ АЛІАСУ: Цей мапінг повинен працювати
    // Якщо ваш аліас @/ веде до кореня проєкту
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(config);
