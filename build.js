/* eslint-disable */
const esbuild = require('esbuild');

// Run esbuild with your configuration
esbuild
  .build({
    entryPoints: ['src/app.ts'],
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    platform: 'node',
    outdir: 'dist',
    target: 'node20',
    tsconfig: 'tsconfig.json',
    external: [
      'pg', // PostgreSQL client
      'mysql2',
      'mysql',
      'sqlite3',
      'better-sqlite3',
      'oracledb',
      'tedious',
      'pg-query-stream',
    ],
  })
  .catch(() => process.exit(1));
