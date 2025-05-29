export class MediaError extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'MediaError';
  }
}

export class InvalidFileReaderResult extends MediaError {
  constructor(message = '') {
    super(message);
    this.name = 'InvalidFileReaderResult';
  }
}
