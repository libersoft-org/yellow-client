import { type FileDownload, type FileUpload, type FileUploadRecord, FileUploadRecordStatus, FileUploadRecordType, type MakeFileDownloadData, type MakeFileUploadData, type MakeFileUploadRecordData } from './types.ts';
import { v4 as uuidv4 } from 'uuid';

export function makeFileUploadRecord(data: MakeFileUploadRecordData): FileUploadRecord {
 const defaults = {
  id: uuidv4(),
  status: FileUploadRecordStatus.BEGUN,
  type: FileUploadRecordType.SERVER,
  fileOriginalName: '',
  fileMimeType: '',
  fileSize: 0,
  filePath: '',
  tempFilePath: '',
  chunkSize: 0,
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

export function assembleFile(receivedChunks: any[], fileName: string) {
 const blob = new Blob(receivedChunks); // Combine all chunks into a Blob
 const downloadLink = document.createElement('a');
 downloadLink.href = URL.createObjectURL(blob);
 downloadLink.download = fileName;
 downloadLink.style.display = 'none';

 document.body.appendChild(downloadLink);
 downloadLink.click();
 document.body.removeChild(downloadLink);

 console.log(`File download complete: ${fileName}`);
}
