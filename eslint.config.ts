import globals from 'globals'
import type { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: [
      'node_modules',
      'dist',
      'prisma',
      '.env',
      'coverage',
      '.husky',
      '.vscode',
      '*.json',
      '*.lock',
      '*.sql',
      'logs',
      'html',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  } as Linter.Config,
  ...(tseslint.configs.recommended as Linter.Config[]),
])
