import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/scripts/**',
      '**/*.d.ts',
      'logs',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/tests/**',
        '**/*.d.ts',
        '**/migrations/**',
        'logs',
        'src/app.ts',
        'src/server.ts',
        'src/modules/logger.ts',
        'src/modules/handleError.ts',
        'src/modules/rateLimit.ts',
      ],
    },
  },
})
