import { writable } from "svelte/store";
import type { FileDownload, FileDownloadStoreType, FileDownloadStoreValue } from "./types.ts";


export class FileDownloadStore implements FileDownloadStoreType {
 store = writable<FileDownloadStoreValue>({})

 get (id: string) {
  let download: FileDownload | undefined
  this.store.subscribe((store) => {
   download = store[id]
  })
  return download
 }

 set (id: string, download: FileDownload) {
  this.store.update((store) => {
   store[id] = download
   return {...store}
  })
 }

 patch (id: string, data: Partial<FileDownload>) {
  this.store.update((store) => {
   store[id] = {...store[id], ...data}
   return {...store}
  })
 }

 delete (id: string) {
  this.store.update((store) => {
   delete store[id]
   return {...store}
  })
 }
}

const fileDownloadStore = new FileDownloadStore()
export default fileDownloadStore
