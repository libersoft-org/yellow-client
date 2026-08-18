#!/usr/bin/env node
/**
 * Creates the accounts the E2E suite expects, through the server's documented admin API
 * (`admin_login`, `admin_domains_list`, `admin_domains_add`, `admin_users_list`, `admin_users_add`).
 *
 * Two specs - messages/tests/e2e/everything.test.ts and forwarding.test.ts - wait for an account to
 * come online and time out after 620 s when these users do not exist. Everything else in the suite
 * passes without them.
 *
 * It is idempotent: existing users and the domain are left alone, so re-running is safe.
 *
 *   ADMIN_USER=admin ADMIN_PASSWORD=... \
 *   SERVER_URL=wss://amtp.mediasun.cz/ \
 *   node scripts/seed-e2e-accounts.mjs
 *
 * Add --dry-run to print what it would create without touching anything.
 */

const SERVER_URL = process.env.SERVER_URL || 'ws://localhost:8084';
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const DRY_RUN = process.argv.includes('--dry-run');

/** Accounts the E2E specs log in as. Password is the one the tests type. */
const DOMAIN = 'example.com';
const PASSWORD = 'password';
const USERNAMES = ['user1', 'user2', 'user3', 'forward_test_user1', 'forward_test_user2', 'forward_test_user3'];

if (!ADMIN_USER || !ADMIN_PASSWORD) {
	console.error('Set ADMIN_USER and ADMIN_PASSWORD (admin credentials for the Yellow server).');
	process.exit(2);
}

let nextRequestId = 1;
const pending = new Map();

function send(ws, command, params = {}, sessionID) {
	const requestID = String(nextRequestId++);
	return new Promise((resolve, reject) => {
		pending.set(requestID, { resolve, reject });
		/* The envelope the server expects: the command lives under `data`, see core/scripts/socket.ts. */
		ws.send(JSON.stringify({ requestID, ...(sessionID ? { sessionID } : {}), data: { command, params } }));
		setTimeout(() => {
			if (pending.delete(requestID)) reject(new Error(`Timed out waiting for "${command}"`));
		}, 20_000);
	});
}

function connect(url) {
	return new Promise((resolve, reject) => {
		const ws = new WebSocket(url);
		ws.addEventListener('open', () => resolve(ws));
		ws.addEventListener('error', () => reject(new Error(`Could not connect to ${url}`)));
		ws.addEventListener('message', event => {
			let msg;
			try {
				msg = JSON.parse(event.data);
			} catch {
				return;
			}
			const waiter = msg.requestID && pending.get(msg.requestID);
			if (!waiter) return;
			pending.delete(msg.requestID);
			if (msg.error && msg.error !== false) waiter.reject(new Error(msg.message || JSON.stringify(msg.error)));
			else waiter.resolve(msg.data ?? msg);
		});
	});
}

async function main() {
	console.log(`Connecting to ${SERVER_URL}`);
	const ws = await connect(SERVER_URL);

	const login = await send(ws, 'admin_login', { username: ADMIN_USER, password: ADMIN_PASSWORD });
	const sessionID = login.sessionID;
	if (!sessionID) throw new Error('Admin login did not return a session');
	console.log('Logged in as admin');

	const domains = await send(ws, 'admin_domains_list', {}, sessionID);
	const list = domains.domains ?? domains ?? [];
	let domain = list.find(d => d.name === DOMAIN);
	if (!domain) {
		if (DRY_RUN) {
			console.log(`[dry run] would create domain ${DOMAIN}`);
		} else {
			console.log(`Creating domain ${DOMAIN}`);
			await send(ws, 'admin_domains_add', { name: DOMAIN }, sessionID);
			const refreshed = await send(ws, 'admin_domains_list', {}, sessionID);
			domain = (refreshed.domains ?? refreshed ?? []).find(d => d.name === DOMAIN);
		}
	}
	if (!domain && !DRY_RUN) throw new Error(`Could not find or create the domain ${DOMAIN}`);
	const domainID = domain?.id;

	const usersResponse = await send(ws, 'admin_users_list', {}, sessionID);
	const existing = new Set((usersResponse.users ?? usersResponse ?? []).filter(u => u.id_domains === domainID || u.domain === DOMAIN).map(u => u.username));

	let created = 0;
	for (const username of USERNAMES) {
		if (existing.has(username)) {
			console.log(`ok    ${username}@${DOMAIN} (already exists)`);
			continue;
		}
		if (DRY_RUN) {
			console.log(`[dry run] would create ${username}@${DOMAIN}`);
			continue;
		}
		await send(ws, 'admin_users_add', { username, domainID, visible_name: username, password: PASSWORD }, sessionID);
		console.log(`added ${username}@${DOMAIN}`);
		created++;
	}

	console.log(DRY_RUN ? 'Dry run complete - nothing was changed.' : `Done. ${created} account(s) created.`);
	ws.close();
}

main().catch(error => {
	console.error('Seeding failed:', error.message);
	process.exit(1);
});
