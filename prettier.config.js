//* reload VS Code on config changes

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export default {
  semi: false,
  singleQuote: true,

  plugins: ['@ianvs/prettier-plugin-sort-imports'],

  importOrder: [
    '<TYPES>',
    '',
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[.]',
  ],
  importOrderTypeScriptVersion: '5.0.0',
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],

  overrides: [
    {
      files: ['**/*.json', '**/*.json5', '**/*.jsonc'],
      options: {
        trailingComma: 'none',
      },
    },
  ],
}
