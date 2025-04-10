import { defineConfig } from 'vitest/config';
import path from 'node:path';

const alias = {
 '@': path.resolve(__dirname, './src')
}

export default defineConfig({
 test: {
  environment: 'jsdom',
  include: ['**/unit/*.{test,spec}.?(c|m)[jt]s?(x)'],
 },
 resolve: process.env.VITEST
  ? {
   conditions: ['browser'],
   alias
  }
  : undefined,

 define: {
  __BUILD_DATE__: new Date(),
  __COMMIT_HASH__: null,
 },
});
