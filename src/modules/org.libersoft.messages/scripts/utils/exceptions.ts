// Custom error class for successful import with warnings
export class ImportSuccessWithWarnings extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ImportSuccessWithWarnings';
	}
}
