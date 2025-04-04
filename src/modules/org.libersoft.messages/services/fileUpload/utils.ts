import { type FileDownload, type FileUpload, type FileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, type MakeFileDownloadData, type MakeFileUploadData, type MakeFileUploadRecordData } from './types.ts';
import { v4 as uuidv4 } from 'uuid';
import MediaUtils from '../media/Media.utils.ts';

export function makeFileUploadRecord(data: MakeFileUploadRecordData): FileUploadRecord {
 const defaults = {
  id: uuidv4(),
  status: FileUploadRecordStatus.BEGUN,
  errorType: null,
  type: FileUploadRecordType.SERVER,
  fileOriginalName: '',
  fileMimeType: '',
  fileSize: 0,
  filePath: '',
  tempFilePath: '',
  chunkSize: 0,
  metadata: null,
 };
 return Object.assign(defaults, data);
}

export function makeFileUpload(data: MakeFileUploadData): FileUpload {
 const defaults = {
  chunksSent: [],
  uploadInterval: null,
 };
 return Object.assign(defaults, data);
}

export function makeFileDownload(data: MakeFileDownloadData): FileDownload {
 const defaults = {
  chunksReceived: [],
  data: null,
  running: false,
  createdAt: Date.now(),
 };
 return Object.assign(defaults, data);
}

export async function blobToBase64(blob: Blob) {
 const arrayBuffer = await blob.arrayBuffer(); // Get ArrayBuffer from the Blob
 const bytes = new Uint8Array(arrayBuffer); // Convert ArrayBuffer to Uint8Array
 let binaryString = '';

 for (let i = 0; i < bytes.length; i++) {
  binaryString += String.fromCharCode(bytes[i]); // Convert bytes to binary string
 }

 return btoa(binaryString); // Convert binary string to Base64
}

export async function base64ToUint8Array(base64: string) {
 return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Triggers client file download by providing url or blob
 *
 * @param file {string | Blob} - url or blob
 * @param fileName - name of the file (this name will be used when downloading)
 */
export function assembleFile(file: string | Blob, fileName: string) {
 const downloadLink = document.createElement('a');
 downloadLink.href = file instanceof Blob ? URL.createObjectURL(file) : file;
 downloadLink.download = fileName;
 downloadLink.target = '_blank';
 downloadLink.style.display = 'none';

 document.body.appendChild(downloadLink);
 downloadLink.click();
 document.body.removeChild(downloadLink);

 console.log(`File download complete: ${fileName}`);
}

export async function transformFilesForServer(files: FileList) {
 for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const mimeType = file.type;

  if (mimeType.startsWith('audio/')) {
   // console.log('transform audio file', file);

   // @ts-ignore todo metadata typing
   file.metadata = await MediaUtils.getAudioDataFromArrayBuffer(await file.arrayBuffer());
  }
 }

 return files;
}
