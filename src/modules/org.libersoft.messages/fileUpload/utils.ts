import {
 type FileUploadRecord,
 FileUploadRecordStatus,
 FileUploadRecordType,
 type MakeFileUploadRecordData,
} from './types.ts'
import { v4 as uuidv4 } from 'uuid'

export function makeFileUploadRecord (data: MakeFileUploadRecordData): FileUploadRecord {
 const defaults = {
  id: uuidv4(),
  status: FileUploadRecordStatus.BEGUN,
  type: FileUploadRecordType.SERVER,
  fileName: '',
  fileMimeType: '',
  fileSize: 0,
  filePath: '',
  tempFilePath: '',
  chunkSize: 0,
 }
 return Object.assign(defaults, data)
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
