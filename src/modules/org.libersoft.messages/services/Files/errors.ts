export class FilesServiceError extends Error {
	constructor(message) {
		super(message);
		this.name = 'FilesServiceError';
	}
}
