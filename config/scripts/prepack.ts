import fs from 'node:fs'
import path from 'node:path'
import { globby } from 'globby'

async function prepack() {
  const rootPath = (p: string) => path.posix.join(process.cwd(), p)
  const distPath = (p = '') => rootPath(path.posix.join('dist', p))
  if (!fs.existsSync(distPath())) fs.mkdirSync(distPath())

  /////////////////////////
  // COPY included files //
  /////////////////////////

  const defaultIgnoreFile = path.join(
    import.meta.dirname,
    '../.default.npmignore',
  )
  const tempRootIgnoreFile = path.resolve(
    process.cwd(),
    path.basename(defaultIgnoreFile),
  )
  fs.copyFileSync(defaultIgnoreFile, tempRootIgnoreFile)

  // https://github.com/sindresorhus/globby
  let files = await globby(['**/*'], {
    ignoreFiles: [path.basename(tempRootIgnoreFile), '.npmignore'], //? must be located at the root
    dot: true,
    onlyFiles: true,
  })
  //? `globby` fails with glob patterns like '!dist/**/*[!.map]' (1/3)
  // const filesSet = new Set(files)

  fs.unlinkSync(tempRootIgnoreFile)

  // filter out *.map files
  const distFiles = await globby(
    [
      // 'dist/**/*', //? `globby` issue (2/3)
      'dist/**/*.map',
    ],
    {
      dot: true,
      onlyFiles: true,
    },
  )
  for (const file of distFiles) {
    // if (!filesSet.has(file)) //? `globby` issue (3/3)
    fs.unlinkSync(file)
  }

  // from https://docs.npmjs.com/cli/v9/using-npm/developers#keeping-files-out-of-your-package
  const neverIgnored = ['package.json', 'README*', 'CHANGELOG*', 'LICEN[SC]E']
  files = files.concat(
    await globby(neverIgnored, {
      dot: true,
      onlyFiles: true,
    }),
  )

  files = files.filter((file) => {
    if (file.startsWith('dist/')) return false
    if (file === 'package.json') return false
    return true
  })

  for (const file of files) {
    const fileSrcPath = rootPath(file)
    const fileDstPath = distPath(
      file.startsWith('src/')
        ? path.posix.relative(rootPath('src'), fileSrcPath)
        : path.basename(file),
    )

    const dstDir = path.posix.dirname(fileDstPath)
    if (!fs.existsSync(dstDir)) {
      fs.mkdirSync(dstDir, { recursive: true })
    }

    fs.copyFileSync(fileSrcPath, fileDstPath)
  }

  /////////////////////////////////
  // PROCESS & COPY package.json //
  /////////////////////////////////

  const packageJsonPath = rootPath('package.json')
  const packageData = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf-8'),
  ) as PackageJson

  delete packageData.engines
  delete packageData.scripts
  delete packageData.devDependencies
  delete packageData.lerna
  delete packageData.gitHead
  const makeDistRelative = (p: string) => `./${path.posix.relative('dist', p)}`
  packageData.main &&= makeDistRelative(packageData.main)
  packageData.types &&= makeDistRelative(packageData.types)

  if (packageData.exports) {
    if (Array.isArray(packageData.exports)) {
      // TODO
      throw Error('Unsupported "exports" field structure (1)')
    } else if (typeof packageData.exports === 'object') {
      Object.entries(packageData.exports).forEach(([ek, entryPoint]) => {
        if (!entryPoint) return

        if (typeof entryPoint === 'object') {
          if (Array.isArray(entryPoint)) {
            // TODO
            throw Error('Unsupported "exports" field structure (2)')
            return
          }
          Object.entries(entryPoint).forEach(([k, v]) => {
            if (Array.isArray(v)) {
              // TODO
              throw Error('Unsupported "exports" field structure (3)')
              return
            }
            if (typeof v === 'object') {
              // TODO
              throw Error('Unsupported "exports" field structure (4)')
              return
            }
            entryPoint[k] &&= makeDistRelative(v)
          })
          return
        }
        ;(packageData.exports as Record<string, packageExportsEntryPath>)[ek] =
          makeDistRelative(entryPoint)
      })
    } else {
      packageData.exports = makeDistRelative(packageData.exports)
    }
  }

  fs.writeFileSync(
    distPath(path.posix.basename(packageJsonPath)),
    JSON.stringify(packageData, null, 2),
  )
}

prepack().catch((err: unknown) => {
  console.error('Error (prepack):', err)
  process.exit(1)
})

/* -------- */

// type PackageJson = Partial<typeof packageJson>
/** @see {@link https://www.schemastore.org/package.json} */
type PackageJson = Partial<{
  main: string
  types: string
  exports:
    | packageExportsEntryPath
    | {
        '.': packageExportsEntryOrFallback
        [props: `./${string}`]: packageExportsEntryOrFallback
      }
    | packageExportsEntryObject
    | packageExportsFallback
  engines: {
    node: string
    [props: string]: string
  }
  scripts: Record<string, string>
  devDependencies: Record<string, string>
  lerna: any
  gitHead: any
}>

// exports schema
type packageExportsEntryPath = string | null
type packageExportsEntryOrFallback =
  | packageExportsEntry
  | packageExportsFallback
type packageExportsEntry = packageExportsEntryPath | packageExportsEntryObject
interface packageExportsEntryObject {
  require: packageExportsEntryOrFallback
  import: packageExportsEntryOrFallback
  'module-sync': packageExportsEntryOrFallback
  node: packageExportsEntryOrFallback
  default: packageExportsEntryOrFallback
  types: packageExportsEntryOrFallback
  [props: string]: packageExportsEntryOrFallback // "^[^.0-9]+$"
  [props: `types@${string}`]: packageExportsEntryOrFallback
}
type packageExportsFallback = packageExportsEntry[]
