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
