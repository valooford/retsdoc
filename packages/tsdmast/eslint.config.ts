import { defineConfig, globalIgnores } from 'eslint/config'

import base from '../../eslint.config'

export default defineConfig([
  base,
  globalIgnores(['!packages/**'], 'Unignore files in workspaces'),
  {
    rules: {
      // . . .
    },
  },
])
