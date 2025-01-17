import { type FileUploadRecord, FileUploadRecordType, FileUploadType } from './types.ts'
import FileUploadStore from './fileUploadStore.ts'
import { blobToBase64, makeFileUploadRecord } from './utils.ts'
import EventEmitter from 'events'

export enum FileUploadManagerEvents {
 BEFORE_UPLOAD_BEGIN = 'beforeUploadBegin',
 UPLOAD_BEGIN = 'uploadBegin',
 AFTER_UPLOAD_BEGIN = 'afterUploadBegin',

 UPLOAD_CHUNK = 'uploadChunk',
 RECORD_UPDATE = 'recordUpdate',
}

export interface FileUpload {
 type: FileUploadType
 file: File
 record: FileUploadRecord
 chunksSent: number[]
 uploadInterval: NodeJS.Timeout | null
 paused?: boolean
}

export interface FileDownload {
 record: FileUploadRecord
 chunksReceived: number[]
 data: any
}

class FileUploadManager extends EventEmitter {
 uploads: Map<string, FileUpload> = new Map()
 downloads: Map<string, FileDownload> = new Map()

 beginUpload (
  files: FileList,
  type: FileUploadRecordType
 ) {
  const uploads: FileUpload[] = []
  for (let i = 0; i < files.length; i++) {
   const file = files[i]
   const record = makeFileUploadRecord({
    type,
    fileName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    chunkSize: 1024 * 64, // todo: default/conf value
   })
   const upload = {
    type: FileUploadType.ACTIVE_UPLOAD,
    file,
    record,
    chunksSent: [],
    uploadInterval: null
   }
   this.uploads.set(upload.record.id, upload)
   uploads.push(upload)
  }

  this.emit(FileUploadManagerEvents.BEFORE_UPLOAD_BEGIN, {uploads})
  this.emit(FileUploadManagerEvents.UPLOAD_BEGIN, {uploads})
  this.emit(FileUploadManagerEvents.AFTER_UPLOAD_BEGIN, {uploads})
 }

 async startUpload (records: FileUploadRecord[]) {
  records.forEach(record => {
   const upload = this.uploads.get(record.id)
   if (!upload) {
    return
   }

   upload.uploadInterval = setInterval(async () => {
    if (upload.paused) {
     return
    }
    const {chunksSent} = upload
    const {chunkSize} = upload.record
    const lastChunkId = chunksSent[chunksSent.length - 1]
    const newChunkId = lastChunkId === undefined ? 0 : lastChunkId + 1
    const blob = upload.file.slice(
     newChunkId * chunkSize,
     newChunkId * chunkSize + chunkSize
    )

    // end if last or no more data
    if (blob.size === 0) {
     clearInterval(upload.uploadInterval as NodeJS.Timeout)
     return
    }

    const chunk = {
     chunkId: newChunkId,
     uploadId: record.id,
     checksum: '',
     data: await blobToBase64(blob)
    }

    chunksSent.push(newChunkId)
    // this.emit(FileUploadManagerEvents.RECORD_UPDATE, {uploads})
    this.emit(FileUploadManagerEvents.UPLOAD_CHUNK, {upload, chunk})
   }, 1000)
  })
 }

 getUpload (uploadId: string) {
  const existingUpload = this.uploads.get(uploadId)

  if (existingUpload) {
   return existingUpload
  }
 }

 updateUploadRecord (uploadId: string, record: FileUploadRecord) {
  const upload = this.uploads.get(uploadId)

  if (!upload) {
   return
  }

  upload.record = record
  this.emit(FileUploadManagerEvents.RECORD_UPDATE, {upload})
 }

 downloadFile (record: FileUploadRecord) {

 }

 pauseUpload (uploadId: string) {
  const upload = this.uploads.get(uploadId)

  if (!upload) {
   return
  }

  upload.paused = true
 }

 resumeUpload (uploadId: string) {
  const upload = this.uploads.get(uploadId)

  if (!upload) {
   return
  }

  upload.paused = false
 }
}

const fileUploadManager = new FileUploadManager();
export default fileUploadManager;
