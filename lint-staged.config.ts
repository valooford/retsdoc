import type { Configuration } from 'lint-staged'

// https://github.com/lint-staged/lint-staged?tab=readme-ov-file#using-js-configuration-files
export default {
  '!(packages)/**/*': ['echo LINT-STAGED'],
  'packages/**/*': (files) => {
    const [f] = files
    if (!f) return []
    const relative = f.slice(process.cwd().length + 1)
    const pkg = /packages\/(.*?)\//.exec(relative)?.[1] ?? ''

    const filesStr = files.map((f) => `"${f}"`).join(' ')
    const opt = (flag: string) => (pkg ? flag : '') // every package

    return []
  },
} as Configuration
