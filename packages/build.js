import { build } from 'esbuild'

//
// in packages dir:
//
// node ./build.js
//
// output in dist/index.js (sparklines-test01/index.js)
//
// npx dts-bundle-generator -o ./dist/index.d.ts index.ts
//
// npm publish

const sharedConfig = {
  entryPoints: ["./index.ts"],
  bundle: true,
  minify: true
}

build({
  ...sharedConfig,
  platform: 'browser',
  format: 'esm',
  outfile: "dist/index.js",
})
