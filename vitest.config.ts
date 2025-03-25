import { defineConfig } from 'vitest/config';
import path from "node:path";

const alias = {
 '@/org.libersoft.messages': path.resolve(__dirname, './src/modules/org.libersoft.messages'),
 '@': path.resolve(__dirname, './src')
}

export default defineConfig({
 test: {
  environment: 'jsdom',
  include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
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
