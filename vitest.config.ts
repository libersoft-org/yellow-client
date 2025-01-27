import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
  },
  resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
