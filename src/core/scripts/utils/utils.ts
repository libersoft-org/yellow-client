export function order(dict: { [key: string]: { order?: number; id: number | string } }): { order?: number; id: number | string }[] {
	//console.log('ORDER dict:', dict);
	let result = Object.values(dict).sort((a, b) => {
		let a_order = a.order !== undefined ? a.order : a.id;
		let b_order = b.order !== undefined ? b.order : b.id;
		if (typeof a_order === 'number' && typeof b_order === 'number') {
			return a_order - b_order;
		} else {
			return String(a_order).localeCompare(String(b_order));
		}
	});
	//console.log('ORDER result:', result);
	return result;
}

export function getGuid(length = 40): string {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	let result = '';
	const array = new Uint8Array(length);
	crypto.getRandomValues(array);

	for (let i = 0; i < length; i++) {
		result += chars[array[i] % chars.length];
	}

	return result;
}

export function stringifyWithBigInt(obj: any): string {
	return JSON.stringify(
		obj,
		(key, value) => {
			if (typeof value === 'bigint') return value.toString();
			return value;
		},
		2
	);
}
