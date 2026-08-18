/* Where the E2E suite expects the client to be served.
 *
 * The tests used to hardcode `http://localhost:3000` in ~28 places, which meant they could only ever
 * run against a plain-HTTP dev server. `vite dev` serves over HTTPS whenever a certificate is
 * present (see vite.config.js), so a normal development machine could not run the suite at all.
 * Point PLAYWRIGHT_CLIENT_URL at whatever the client is actually served from; Playwright is
 * configured with ignoreHTTPSErrors, so a self-signed certificate is fine. */
export const CLIENT_URL = process.env['PLAYWRIGHT_CLIENT_URL'] || 'http://localhost:3000/';

/** Address of the AMTP server the test accounts live on. */
export const SERVER_URL = process.env['PLAYWRIGHT_SERVER_URL'] || 'ws://localhost:8084';
