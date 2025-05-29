import type { DeepPartial } from '@/types.ts';
import { type CustomFile, type FileDownload, type FileUpload, FileUploadRecordType, FileUploadRole } from '@/org.libersoft.messages/services/Files/types.ts';
import { makeFileDownload, makeFileUpload, makeFileUploadRecord } from '@/org.libersoft.messages/services/Files/utils.ts';
import _merge from 'lodash/merge';
import { defineMeta } from '@storybook/addon-svelte-csf';
//import FileView from '../FileView.svelte';
import { fn } from '@storybook/test';

class FileViewStoriesUtils {
 static makeDefaultStoryArgs(mergeWithMeta?: Parameters<typeof defineMeta>[0]) {
  return _merge(
   {
    parameters: {
     viewport: {
      defaultViewport: 'messageList',
     },
    },
    args: {
     download: null,
     pauseUpload: fn(),
     resumeUpload: fn(),
     cancelUpload: fn(),
     resumeDownload: fn(),
     pauseDownload: fn(),
     cancelDownload: fn(),
     onDownload: fn(),
     changingStatus: false,
    },
   },
   mergeWithMeta
  );
 }

 static makeUpload(mergeWithData: DeepPartial<FileUpload>) {
  const file = {
   name: 'test-file.pdf',
   type: 'application/pdf',
   size: 1024 * 1024 * 2,
   metadata: {
    test: 'test',
   },
  } as CustomFile;
  const acc = {
   id: 123,
   uid: 'test-uid',
  };
  const record = makeFileUploadRecord({
   type: FileUploadRecordType.SERVER,
   fileOriginalName: file.name,
   fileMimeType: file.type,
   fileSize: file.size,
   chunkSize: 1024 * 64,
   fromUserUid: acc.uid,
   metadata: file.metadata,
  });
  const upload = makeFileUpload({
   role: FileUploadRole.SENDER,
   file,
   record,
   acc,
   chunksSent: [1, 2, 3],
  });

  return _merge(upload, mergeWithData);
 }

 static makeDownload(mergeWithData: DeepPartial<FileDownload>) {
  const file = {
   name: 'test-file.pdf',
   type: 'application/pdf',
   size: 1024 * 1024 * 2,
   metadata: {
    test: 'test',
   },
  } as CustomFile;
  const acc = {
   id: 123,
   uid: 'test-uid',
  };
  const download = makeFileDownload({
   record: makeFileUploadRecord({
    type: FileUploadRecordType.SERVER,
    fileOriginalName: file.name,
    fileMimeType: file.type,
    fileSize: file.size,
    chunkSize: 1024 * 64,
    fromUserUid: acc.uid,
    metadata: file.metadata,
   }),
  });

  return _merge(download, mergeWithData);
 }

 static makeServerSenderUpload(mergeWithData: DeepPartial<FileUpload>) {
  return this.makeUpload(
   _merge(
    {
     role: FileUploadRole.SENDER,
     record: {
      type: FileUploadRecordType.SERVER,
     },
    },
    mergeWithData
   )
  );
 }

 static makeServerReceiverUpload(mergeWithData: DeepPartial<FileUpload>) {
  return this.makeUpload(
   _merge(
    {
     role: FileUploadRole.RECEIVER,
     record: {
      type: FileUploadRecordType.SERVER,
     },
    },
    mergeWithData
   )
  );
 }

 static makeP2PSenderUpload(mergeWithData: DeepPartial<FileUpload>) {
  return this.makeUpload(
   _merge(
    {
     role: FileUploadRole.SENDER,
     record: {
      type: FileUploadRecordType.P2P,
     },
    },
    mergeWithData
   )
  );
 }

 static makeP2PReceiverUpload(mergeWithData: DeepPartial<FileUpload>) {
  return this.makeUpload(
   _merge(
    {
     role: FileUploadRole.RECEIVER,
     record: {
      type: FileUploadRecordType.P2P,
     },
    },
    mergeWithData
   )
  );
 }

 static makeP2PReceiverDownload(mergeWithData: DeepPartial<FileUpload>) {
  return;
 }
}

export default FileViewStoriesUtils;
