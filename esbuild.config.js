const esbuild = require('esbuild');

esbuild.buildSync({
    entryPoints: ['index.ts'],
    outdir: 'dist',
    bundle: true,
    platform: 'node',
    target: ['node20']
});
