/* eslint-disable */
import * as esbuild from 'esbuild';

// Run esbuild with your configuration
await esbuild
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
      // 'pg',
      'mysql2',
      'mysql',
      'sqlite3',
      'better-sqlite3',
      'oracledb',
      'tedious',
      'pg-query-stream',
      'nock',
      'aws-sdk',
      'mock-aws-s3',
    ],
    loader: {
      '.html': 'copy',
      '.json': 'copy',
    },
  })
  .catch(() => process.exit(1));
