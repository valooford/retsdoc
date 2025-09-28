import js from '@eslint/js'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import { Linter } from 'eslint'
import prettier from 'eslint-config-prettier/flat'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

type Config = ReturnType<typeof defineConfig>[number]

export default defineConfig([
  globalIgnores(['.*/*', 'dist/*', 'packages/**'], 'Ignore irrelevant files'),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: [
      'js/recommended',
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    settings: {
      //? fix `Unable to resolve path to module` - missing file extensions in paths
      'import/resolver': {
        typescript: true,
      },
    },
  },
  //? fix (https://typescript-eslint.io/getting-started/typed-linting/)
  // <<<
  //     Error: Error while loading rule '@typescript-eslint/await-thenable':
  //     You have used a rule which requires type information, but don't have
  //     parserOptions set to generate type information for this file.
  //                                                                          >>>
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser as Linter.Parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // https://typescript-eslint.io/users/configs
    extends: [
      tseslint.configs.strictTypeChecked as Config,
      tseslint.configs.stylisticTypeChecked as Config,
    ],
    rules: {
      'import/no-cycle': 2,
      'import/no-named-as-default-member': 0,

      //? actively used
      '@typescript-eslint/no-explicit-any': 0,

      //? allow _underscored ones (https://typescript-eslint.io/rules/no-unused-vars/#what-benefits-does-this-rule-have-over-typescript)
      '@typescript-eslint/no-unused-vars': [
        2,
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // . . .
    },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
    ignores: ['**/{tsconfig{,.node},nx,project}.json'],
  },
  {
    files: ['**/*.jsonc', '**/{nx,project}.json'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/commonmark',
    extends: ['markdown/recommended'],
  },
  prettier,
])
