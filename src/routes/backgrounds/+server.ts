import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function getDirectoryContents(dirPath: string): Promise<any> {
	const items = await readdir(dirPath, { withFileTypes: true });
	const contents: any = [];

	for (const item of items) {
		if (item.isFile()) contents.push(item.name);
	}
	return contents;
}

export const GET: RequestHandler = async () => {
	try {
		const staticPath = join(process.cwd(), 'static/img/background');
		const contents = await getDirectoryContents(staticPath);
		return json(contents);
	} catch (error) {
		return json({ error: 'Failed to read static directory' }, { status: 500 });
	}
};
