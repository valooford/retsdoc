import type { Options } from 'tsdown'

import { defineConfig } from 'tsdown'

export default defineConfig((options) => {
  const dts: Options['dts'] = {
    //? do not use cache when updating .d.ts (https://github.com/sxzz/rolldown-plugin-dts?tab=readme-ov-file#newcontext)
    newContext: options.watch === true,
  }

  const onSuccess = ['echo Done']
  if (!options.watch) onSuccess.push('echo Bundle: Production')

  return [
    {
      entry: ['src/index.ts'],
      hash: false,
      target: 'esnext',
      dts,
      onSuccess: onSuccess.join(' && '),
    },
  ]
})
