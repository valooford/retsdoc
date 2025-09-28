import type { Configuration } from 'lint-staged'

// https://github.com/lint-staged/lint-staged?tab=readme-ov-file#using-js-configuration-files
export default {
  '!(packages)/**/*': [
    `prettier --write --ignore-unknown`, // --experimental-cli causes trailingComma in jsonc
    `eslint --cache --max-warnings 0 --no-warn-ignored`,
  ],
  'packages/**/*': (files) => {
    const [f] = files
    if (!f) return []
    const relative = f.slice(process.cwd().length + 1)
    const pkg = /packages\/(.*?)\//.exec(relative)?.[1] ?? ''

    const filesStr = files.map((f) => `"${f}"`).join(' ')
    const opt = (flag: string) => (pkg ? flag : '') // every package

    return [
      `prettier --write --ignore-unknown${opt(` --config-path packages/${pkg}/prettier.config.js`)} ${filesStr}`, // --experimental-cli causes trailingComma in jsonc
      `eslint --cache --max-warnings 0 --no-warn-ignored${opt(` -c packages/${pkg}/eslint.config.ts`)} ${filesStr}`,
    ]
  },
} as Configuration
