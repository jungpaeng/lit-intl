/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const baseBuild = ({
  format,
  outExtension,
  entryPoints = ['src/index.ts'],
  outdir = 'dist',
} = {}) => {
  return build({
    format,
    outExtension,
    entryPoints,
    outdir,
    target: 'es2015',
    bundle: true,
    minify: true,
    sourcemap: true,
    plugins: [nodeExternalsPlugin()],
  });
};

Promise.all([
  baseBuild({ format: 'cjs', outExtension: { '.js': '.min.cjs' } }),
  baseBuild({ format: 'esm', outExtension: { '.js': '.min.mjs' } }),
]).catch(() => process.exit(1));
