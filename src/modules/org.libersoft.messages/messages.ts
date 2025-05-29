import { replaceEmojisWithTags } from './emojis.js';
import { get, writable, type Writable } from 'svelte/store';
import DOMPurify from 'dompurify';
import { log } from '@/core/tauri.js';
import fileUploadManager from '@/org.libersoft.messages/services/Files/FileUploadService.js';
import { FileUploadRecordStatus, FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.js';
import fileDownloadManager from '@/org.libersoft.messages/services/Files/FileDownloadService.js';
import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.js';
import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.js';
import { wrapConsecutiveElements } from './utils/htmlUtils.js';
import { splitAndLinkify, type LinkifyResult } from './splitAndLinkify.js';
import {
  base64ToUint8Array,
  makeFileUpload,
  transformFilesForServer,
} from '@/org.libersoft.messages/services/Files/utils.js';
import {
  active_account,
  active_account_id,
  active_account_module_data,
  getGuid,
  hideSidebarMobile,
  isClientFocused,
  relay,
  selectAccount,
  selected_corepage_id,
  selected_module_id,
  send,
  type Account,
} from '@/core/core.js';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.js';
import retry from 'retry';
import { tick } from 'svelte';
import { messages_db } from './db.js';
import filesDB, { LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.js';
import { addNotification, deleteNotification, type YellowNotification } from '@/core/notifications.js';
import { makeMessageReaction } from './factories/messageFactories.js';

// Type definitions
export interface MessageData {
  uid: string;
  address_from: string;
  address_to: string;
  message: string;
  format?: string;
  created: Date | string;
  seen?: boolean;
  reactions?: MessageReaction[];
  id?: number;
  prev?: number | string | undefined;
  next?: number | string | undefined;
  stripped_text?: string;
  is_outgoing?: boolean;
  remote_address?: string;
  just_sent?: boolean;
  just_marked_as_seen?: boolean;
  received_by_my_homeserver?: boolean;
  is_lazyloaded?: boolean;
}

export interface MessageReaction {
  user_address: string;
  message_uid: string;
  emoji_codepoints_rgi: string;
}

export interface ConversationData {
  acc: WeakRef<Account> | Account;
  address: string;
  id?: string;
  last_message_date?: Date | string;
  last_message_text?: string;
  visible_name?: string | null;
  unread_count?: number;
}

export interface ModuleData {
  online: Writable<boolean>;
  selectedConversation: Writable<ConversationData | null>;
  conversationsArray: Writable<ConversationData[]>;
  events: Writable<MessageEvent[]>;
  messagesArray: Writable<MessageData[]>;
  messagesIsInitialLoading: Writable<boolean>;
  emojiGroups: Writable<any[]>;
  emojisByCodepointsRgi: Writable<any>;
  emojisLoading: Writable<boolean>;
  showGallery: Writable<boolean>;
  galleryFile: Writable<any>;
  new_message_listener?: (event: Event) => Promise<void>;
  seen_message_listener?: (event: Event) => void;
  seen_inbox_message_listener?: (event: Event) => void;
}

export interface MessageEvent {
  type: string;
  array?: MessageData[];
  wasScrolledToBottom2?: boolean;
  referenced_message?: MessageData;
}

export interface ProcessedMessage {
  format: string;
  body: DocumentFragment;
}

export interface UploadChunkParams {
  upload: any;
  chunk: any;
}

export interface DownloadChunkParams {
  uploadId: string;
  offsetBytes: number;
  chunkSize: number;
}

export interface SendDataCallback {
  (req: any, res: any): void;
}

type SendDataParams = Record<string, any>;

// Store exports
export const uploadChunkSize = localStorageSharedStore('uploadChunkSize', 1024 * 1024 * 2);
export const photoRadius = localStorageSharedStore('photoRadius', '50%');
export const hideMessageTextInNotifications = localStorageSharedStore('hideMessageTextInNotifications', false);
export const defaultFileDownloadFolder = localStorageSharedStore('defaultFileDownloadFolder', null);
export const identifier = 'org.libersoft.messages';
export let md = active_account_module_data(identifier);
export let online = relay(md, 'online');
export let conversationsArray = relay(md, 'conversationsArray');
export let events = relay(md, 'events');
export let messagesArray = relay(md, 'messagesArray');
export let messagesIsInitialLoading = relay(md, 'messagesIsInitialLoading');
export let selectedConversation = relay(md, 'selectedConversation');
export let emojiGroups = relay(md, 'emojiGroups');
export let emojisByCodepointsRgi = relay(md, 'emojisByCodepointsRgi');
export let emojisLoading = relay(md, 'emojisLoading');
export let showGallery = relay(md, 'showGallery');
export let galleryFile = relay(md, 'galleryFile');

class Message implements MessageData {
  uid!: string;
  address_from!: string;
  address_to!: string;
  message!: string;
  format?: string;
  created!: Date | string;
  seen?: boolean;
  reactions?: MessageReaction[];
  id?: number;
  prev?: number | string | undefined;
  next?: number | string | undefined;
  stripped_text: string;
  is_outgoing: boolean;
  remote_address: string;
  just_sent?: boolean;
  just_marked_as_seen?: boolean;
  received_by_my_homeserver?: boolean;
  is_lazyloaded?: boolean;
  acc: WeakRef<Account>;

  constructor(acc: Account, data: Partial<MessageData>) {
    Object.assign(this, data);
    this.acc = new WeakRef(acc);
    this.stripped_text = stripHtml(this.message);
    this.is_outgoing = this.address_from === acc.credentials.address;
    if (this.address_to === acc.credentials.address) this.remote_address = this.address_from;
    else this.remote_address = this.address_to;
  }
}

export function initData(acc: Account): ModuleData {
  console.log('initData', acc);
  let result: ModuleData = {
    online: writable(false),
    selectedConversation: writable(null),
    conversationsArray: writable([]),
    events: writable([]),
    messagesArray: writable([]),
    messagesIsInitialLoading: writable(false),
    emojiGroups: writable([]),
    emojisByCodepointsRgi: writable(null),
    emojisLoading: writable(false),
    showGallery: writable(false),
    galleryFile: writable(null),
  };
  return result;
}

function sendData(
  acc: Account,
  account: Writable<Account> | null,
  command: string,
  params: SendDataParams = {},
  sendSessionID: boolean = true,
  callback: SendDataCallback | null = null,
  quiet: boolean = false
): any {
  return _send(acc, account, identifier, command, params, sendSessionID, callback, quiet);
}

function _send(
  acc: Account,
  account: Writable<Account> | null,
  target: string,
  command: string,
  params: SendDataParams,
  sendSessionID: boolean,
  callback: SendDataCallback | null,
  quiet: boolean
): any {
  let cb: SendDataCallback = (req, res) => {
    if (res.error !== false) {
      if (get(acc.module_data[identifier].online) === false) {
        return;
      }
    }
    if (callback) callback(req, res);
  };
  return send(acc, account, target, command, params, sendSessionID, cb, quiet);
}

export function onModuleSelected(selected: boolean): void {
  if (!selected) get(md)?.['selectedConversation']?.set(null);
}

export function selectConversation(conversation: ConversationData): void {
  console.log(
    'SELECTcONVERSATION conversation:',
    conversation,
    'conversation.acc:',
    conversation.acc,
    'conversation.acc?.deref:',
    conversation.acc instanceof WeakRef ? conversation.acc?.deref : null
  );
  selectedConversation.set(conversation);
  events.set([]);
  messagesArray.set([]);
  insertEvent({ type: 'select_conversation', array: get(messagesArray) });
  hideSidebarMobile.set(true);
  const acc = conversation.acc instanceof WeakRef ? conversation.acc.deref() : conversation.acc;
  if (acc) {
    listMessages(acc, conversation.address);
  }
}

export function listConversations(acc: Account): void {
  sendData(acc, null, 'conversations_list', {}, true, (_req, res) => {
    if (res.error !== false) {
      console.error('this is bad.');
      return;
    }
    if (res.data?.conversations) {
      let conversationsArray = acc.module_data[identifier].conversationsArray;
      console.log('listConversations into:', get(conversationsArray));
      conversationsArray.set(res.data.conversations.map((c: any) => sanitizeConversation(acc, c)));
      console.log('listConversations:', get(conversationsArray));
    }
  });
}

function sanitizeConversation(acc: Account, c: any): ConversationData {
  c.acc = new WeakRef(acc);
  c.last_message_text = stripHtml(c.last_message_text);
  return c;
}

function moduleEventSubscribe(acc: Account, event_name: string): void {
  sendData(acc, null, 'subscribe', { event: event_name }, true, (req, res) => {
    if (res.error !== false) {
      console.error('this is bad.');
      window.alert('Communication with server Error while subscribing to event: ' + res.message);
    }
  });
}

export function initComms(acc: Account): void {
  moduleEventSubscribe(acc, 'new_message');
  moduleEventSubscribe(acc, 'seen_message');
  moduleEventSubscribe(acc, 'seen_inbox_message');
  moduleEventSubscribe(acc, 'message_update');
  moduleEventSubscribe(acc, 'upload_update');
  moduleEventSubscribe(acc, 'ask_for_chunk');

  let data = acc.module_data[identifier];

  data.new_message_listener = async (event: Event) => eventNewMessage(acc, event as CustomEvent);
  data.seen_message_listener = (event: Event) => eventSeenMessage(acc, event as CustomEvent);
  data.seen_inbox_message_listener = (event: Event) => eventSeenInboxMessage(acc, event as CustomEvent);

  acc.events?.addEventListener('new_message', data.new_message_listener);
  acc.events?.addEventListener('seen_message', data.seen_message_listener);
  acc.events?.addEventListener('seen_inbox_message', data.seen_inbox_message_listener);
  acc.events?.addEventListener('message_update', message_update);
  acc.events?.addEventListener('upload_update', upload_update);
  acc.events?.addEventListener('ask_for_chunk', ask_for_chunk);

  refresh(acc);
}

export function init(): () => void {
  let subs: (() => void)[] = [];

  subs.push(
    active_account_id.subscribe((acc) => {
      get(md)?.['selectedConversation']?.set(null);
    })
  );

  return function () {
    subs.forEach((sub) => sub());
  };
}

async function refresh(acc: Account): Promise<void> {
  console.log('refresh sendQueuedMessages...', acc);
  await sendOutgoingMessages(acc);
  const selectedConv = get(acc.module_data[identifier].selectedConversation) as ConversationData | null;
  if (selectedConv && selectedConv.address) {
    console.log('refresh listMessages...', acc);
    listMessages(acc, selectedConv.address);
  }
  console.log('refresh listConversations...', acc);
  listConversations(acc);
}

export async function initUpload(files: File[], uploadType: FileUploadRecordType, recipients: string[]): Promise<void> {
  console.log('2222', files, uploadType, recipients);
  const acc = get(active_account);
  if (!acc) return;

  let fileList: FileList;
  try {
    // Transform files first - it can return either FileList or File[]
    const transformedFiles = await transformFilesForServer(files);

    // Convert to FileList if needed
    if (Array.isArray(transformedFiles)) {
      const dataTransfer = new DataTransfer();
      transformedFiles.forEach((file) => dataTransfer.items.add(file));
      fileList = dataTransfer.files;
    } else {
      fileList = transformedFiles;
    }
  } catch (error) {
    console.error('Error transforming files for server:', error);
    return;
  }

  console.log('3333');
  const { uploads } = fileUploadManager.beginUpload(fileList, uploadType, acc, {
    chunkSize: get(uploadChunkSize),
  });

  console.log('uploads', uploads);
  const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  const acceptedAudioTypes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm'];
  const acceptedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/svg+xml',
    'image/x-icon',
    'image/bmp',
  ];

  let messageHtml = '';
  uploads.forEach((upload) => {
    const fileMimeType = upload.record.fileMimeType;
    const isServerType = upload.record.type === FileUploadRecordType.SERVER;

    if (isServerType && acceptedImageTypes.some((v) => fileMimeType.startsWith(v))) {
      messageHtml += `<Imaged file="yellow:${upload.record.id}"></Imaged>`;
      filesDB.addFile({
        localFileStatus: LocalFileStatus.READY,
        fileTransferId: upload.record.id,
        fileOriginalName: upload.record.fileOriginalName,
        fileMimeType: upload.record.fileMimeType,
        fileSize: upload.record.fileSize,
        fileBlob: upload.file ? new Blob([upload.file], { type: fileMimeType }) : new Blob([], { type: fileMimeType }),
      });
    } else if (isServerType && acceptedVideoTypes.some((v) => fileMimeType.startsWith(v))) {
      messageHtml += `<YellowVideo file="yellow:${upload.record.id}"></YellowVideo>`;
    } else if (isServerType && acceptedAudioTypes.some((v) => fileMimeType.startsWith(v))) {
      messageHtml += `<YellowAudio file="yellow:${upload.record.id}"></YellowAudio>`;
    } else {
      messageHtml += `<Attachment id="${upload.record.id}"></Attachment>`;
    }
  });

  console.log('messageHtml', messageHtml);
  setTimeout(() => {
    sendMessage(messageHtml, 'html');
  }, 100);

  const records = uploads.map((upload) => upload.record);
  sendData(acc, null, 'upload_begin', { records, recipients }, true, (req, res) => {
    if (res.error !== false) {
      return;
    }
    if (uploads?.[0].record.type === FileUploadRecordType.SERVER) {
      fileUploadManager.startUploadSerial(res.allowedRecords, uploadChunkAsync);
    } else {
      console.error('Error starting upload');
    }
  });
}

function uploadChunkAsync({ upload, chunk }: UploadChunkParams): Promise<void> {
  return new Promise((resolve, reject) => {
    const op = retry.operation({
      retries: 3,
      factor: 1.5,
      minTimeout: 1000,
      maxTimeout: 3000,
    });

    op.attempt(() => {
      const retryFn = (res?: any) => {
        const willRetry = op.retry(new Error());
        if (!willRetry) {
          reject(res);
        }
      };
      const to = setTimeout(() => {
        retryFn();
      }, 5000);
      sendData(upload.acc, null, 'upload_chunk', { chunk }, true, (req, res) => {
        clearTimeout(to);
        if (res.error !== false) {
          retryFn(res);
          return;
        }
        resolve();
      });
    });
  });
}

function ask_for_chunk(event: Event): void {
  const { uploadId } = (event as CustomEvent).detail.data;
  const upload = fileUploadManager.uploadsStore.get(uploadId);
  if (!upload) {
    return;
  }

  if (upload.record.status === FileUploadRecordStatus.BEGUN) {
    upload.record.status = FileUploadRecordStatus.UPLOADING;
    fileUploadStore.set(uploadId, upload);
    fileUploadManager.startUploadSerial([upload.record], uploadChunkAsync);
  } else {
    fileUploadManager.continueP2PUpload(uploadId);
  }
}

function message_update(event: Event): void {
  const { type, message } = (event as CustomEvent).detail.data;
  console.log('message_update', (event as CustomEvent).detail.data);

  if (type === 'reaction') {
    const messageUid = message.uid;

    messagesArray.update((m) => {
      const foundMessage = m.find((msg) => msg.uid === messageUid);
      if (foundMessage) {
        foundMessage.reactions = message.reactions;
      }
      return m;
    });
    insertEvent({ type: 'properties_update', array: get(messagesArray) });
  }
  if (type === 'delete') {
    if (!message || !message.uid) {
      console.error('message_update: message.uid is missing', message);
      return;
    }
    snipeMessage(message.uid);
  }
}

function upload_update(event: Event): void {
  const { record, uploadData } = (event as CustomEvent).detail.data;
  const currentUpload = fileUploadStore.get(record.id);
  if (currentUpload) {
    if (
      currentUpload.file &&
      [FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.BEGUN, FileUploadRecordStatus.PAUSED].includes(
        record.status
      )
    ) {
      // pass
    } else {
      fileUploadStore.patch(record.id, { record, ...uploadData });
    }
  }
  const currentDownload = fileDownloadStore.get(record.id);
  if (currentDownload) {
    fileDownloadStore.patch(record.id, { record });
  }
}

export function downloadAttachmentsSerial(records: any[], finishCallback: (results: any) => void): any {
  const acc = get(active_account);
  if (!acc) return;
  return fileDownloadManager.startDownloadSerial(records, makeDownloadChunkAsyncFn(acc), finishCallback);
}

export const makeDownloadChunkAsyncFn =
  (acc: Account) =>
  ({ uploadId, offsetBytes, chunkSize }: DownloadChunkParams): Promise<any> => {
    return new Promise((resolve, reject) => {
      sendData(acc, null, 'download_chunk', { uploadId, offsetBytes, chunkSize }, true, async (req, res) => {
        if (res.error !== false) {
          reject(res);
          return;
        }
        resolve({
          chunk: {
            chunkId: res.chunk.chunkId,
            uploadId: res.chunk.uploadId,
            checksum: res.chunk.checksum,
            chunkSize,
            offsetBytes,
            data: await base64ToUint8Array(res.chunk.data),
          },
        });
      });
    });
  };

export function cancelUpload(uploadId: string): void {
  fileUploadManager.cancelUpload(uploadId);
  const acc = get(active_account);
  if (acc) {
    sendData(acc, null, 'upload_cancel', { uploadId }, true, (req, res) => {});
  }
}

export function pauseUpload(uploadId: string): Promise<void> {
  return new Promise((resolve) => {
    fileUploadManager.pauseUpload(uploadId);
    const acc = get(active_account);
    if (acc) {
      sendData(
        acc,
        null,
        'upload_update_status',
        {
          uploadId,
          status: FileUploadRecordStatus.PAUSED,
        },
        true,
        (req, res) => {
          resolve();
        }
      );
    }
  });
}

export function resumeUpload(uploadId: string): Promise<void> {
  return new Promise((resolve) => {
    fileUploadManager.resumeUpload(uploadId);
    const acc = get(active_account);
    if (acc) {
      sendData(
        acc,
        null,
        'upload_update_status',
        {
          uploadId,
          status: FileUploadRecordStatus.UPLOADING,
        },
        true,
        (req, res) => {
          resolve();
        }
      );
    }
  });
}

export function pauseDownload(uploadId: string): void {
  fileDownloadManager.pauseDownload(uploadId);
}

export function resumeDownload(uploadId: string): void {
  fileDownloadManager.resumeDownload(uploadId);
}

export function cancelDownload(uploadId: string): void {
  const download = fileDownloadStore.get(uploadId);
  if (!download) {
    return;
  }
  if (download.record.type === FileUploadRecordType.P2P) {
    cancelUpload(uploadId);
  } else if (download.record.type === FileUploadRecordType.SERVER) {
    fileDownloadManager.cancelDownload(uploadId);
  }
}

export function loadUploadData(uploadId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const existingUpload = fileUploadStore.get(uploadId);
    if (existingUpload) {
      resolve(existingUpload);
      return;
    }

    let acc = get(active_account);
    if (!acc) {
      reject(new Error('No active account'));
      return;
    }

    const op = retry.operation({
      retries: 3,
      factor: 1.5,
      minTimeout: 1000,
      maxTimeout: 3000,
    });

    op.attempt(() => {
      sendData(acc, null, 'upload_get', { id: uploadId }, true, (req, res) => {
        if (res.error !== false) {
          const willRetry = op.retry(res);
          if (!willRetry) {
            reject(res);
          }
          return;
        }

        const { record, uploadData } = res.data;
        const upload = makeFileUpload({
          ...uploadData,
          file: null,
          record,
          chunksSent: [],
          uploadInterval: null,
          acc,
        });
        fileUploadStore.set(uploadId, upload);

        resolve(upload);
      });
    });
  });
}

export function deinitComms(acc: Account): void {
  sendData(acc, null, 'user_unsubscribe', { event: 'new_message' });
  sendData(acc, null, 'user_unsubscribe', { event: 'seen_message' });
  sendData(acc, null, 'user_unsubscribe', { event: 'seen_inbox_message' });
  sendData(acc, null, 'user_unsubscribe', { event: 'upload_update' });
  sendData(acc, null, 'user_unsubscribe', { event: 'ask_for_chunk' });
}

export function deinitData(acc: Account): void {
  console.log('DEINIT DATA');
  let data = acc.module_data[identifier];
  if (!data) return;

  if (data.new_message_listener) {
    acc.events?.removeEventListener('new_message', data.new_message_listener);
  }
  if (data.seen_message_listener) {
    acc.events?.removeEventListener('seen_message', data.seen_message_listener);
  }
  if (data.seen_inbox_message_listener) {
    acc.events?.removeEventListener('seen_inbox_message', data.seen_inbox_message_listener);
  }

  acc.events?.removeEventListener('upload_update', upload_update);
  acc.events?.removeEventListener('ask_for_chunk', ask_for_chunk);

  data.online.set(false);
  data.events.set([]);
  data.messagesArray.set([]);
  data.conversationsArray.set([]);
  data.selectedConversation.set(null);
  acc.module_data[identifier] = null;
}

export function listMessages(acc: Account, address: string): void {
  messagesArray.set([{ type: 'initial_loading_placeholder' } as any]);
  messagesIsInitialLoading.set(true);
  loadMessages(acc, address, 'unseen', 3, 3, 'initial_load', (res) => {});
}

export function loadMessages(
  acc: Account,
  address: string,
  base: string,
  prev: number,
  next: number,
  reason: string,
  cb: (res: any) => void,
  force_refresh: boolean = false
): any {
  console.log('reason', reason, 'force_refresh', force_refresh);
  return sendData(acc, null, 'messages_list', { address, base, prev, next }, true, (_req, res) => {
    if (res.error !== false || !res.data?.messages) {
      console.error(res);
      window.alert('Error while listing messages: ' + (res.message || JSON.stringify(res)));
      return;
    }
    let items = res.data.messages;
    items = constructLoadedMessages(acc, items);
    messagesIsInitialLoading.set(false);
    addMessagesToMessagesArray(items, reason, force_refresh);
    if (cb) cb(res);
  });
}

export function findMessages(acc: Account, address: string, base: string, prev: number, next: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    sendData(acc, null, 'messages_list', { address, base, prev, next }, true, (_req, res) => {
      if (res.error !== false || !res.data?.messages) {
        console.error(res);
        window.alert('Error while finding messages: ' + (res.message || JSON.stringify(res)));
        reject(res);
        return;
      }
      resolve(res.data.messages);
    });
  });
}

export function getMessageByUid(uid: string): Promise<MessageData> {
  return new Promise((resolve, reject) => {
    const found = get(messagesArray).find((m) => m.uid === uid);
    if (found) {
      resolve(found);
      return;
    }
    const acc = get(active_account);
    const selectedConv = get(selectedConversation);
    if (!acc || !selectedConv) {
      reject(new Error('No active account or selected conversation'));
      return;
    }
    const address = selectedConv.address;
    findMessages(acc, address, 'uid:' + uid, 0, 0)
      .then((messages) => {
        const message = messages.find((m) => m.uid === uid);
        resolve(message);
      })
      .catch(reject);
  });
}

function addMessagesToMessagesArray(items: MessageData[], reason: string, force_refresh: boolean): MessageData[] {
  let arr = get(messagesArray);
  arr = arr.filter((m) => (m as any).type !== 'initial_loading_placeholder');
  let result: MessageData[] = [];
  let state = { countAdded: 0 };
  for (let m of items) {
    result.push(addMessage(arr, m, state));
  }
  sortMessages(arr);
  addMissingPrevNext(arr);
  messagesArray.set(arr);
  if (force_refresh || state.countAdded > 0) insertEvent({ type: reason, array: arr });
  else insertEvent({ type: 'properties_update', array: arr });
  return result;
}

export function handleResize(wasScrolledToBottom: boolean): void {
  insertEvent({ type: 'resize', wasScrolledToBottom2: true });
}

export function snipeMessage(messageUid: string): void {
  messagesArray.update((v) => {
    return v.filter((m) => m.uid !== messageUid);
  });
  insertEvent({ type: 'gc', array: get(messagesArray) });
}

function addMessage(arr: MessageData[], msg: MessageData, state: { countAdded: number }): MessageData {
  let m = arr.find((m) => m.uid === msg.uid);
  if (m) {
    for (let key in msg) (m as any)[key] = (msg as any)[key];
    return m;
  } else {
    arr.unshift(msg);
    state.countAdded++;
    return msg;
  }
}

function constructLoadedMessages(acc: Account, data: any[]): MessageData[] {
  let items = data.map((msg) => {
    let message = new Message(acc, msg);
    message.received_by_my_homeserver = true;
    message.is_lazyloaded = true;
    return message;
  });
  return items;
}

function sortMessages(messages: MessageData[]): void {
  messages.sort((a, b) => {
    let akey = a.id;
    let bkey = b.id;
    if (akey === undefined && bkey === undefined) {
      akey = a.created as any;
      bkey = b.created as any;
    } else if (akey === undefined) {
      return 1;
    } else if (bkey === undefined) {
      return -1;
    }
    // TypeScript now knows both are defined
    if (akey! > bkey!) return 1;
    if (akey! < bkey!) return -1;
    return 0;
  });
}

function addMissingPrevNext(messages: MessageData[]): void {
  for (let i = 0; i < messages.length; i++) {
    let m = messages[i];
    if (m.prev === undefined) m.prev = findPrev(messages, i);
    if (m.next === undefined) m.next = findNext(messages, i);
    else if (m.next === 'none') {
      let next = findNext(messages, i);
      if (next !== undefined) m.next = next;
    }
  }
}

function findPrev(messages: MessageData[], i: number): number | string | undefined {
  for (const m of messages) {
    if (m.next === messages[i].id) return m.id;
  }
}

function findNext(messages: MessageData[], i: number): number | string | undefined {
  for (const m of messages) {
    if (m.prev === messages[i].id) return m.id;
  }
}

export function setMessageSeen(message: MessageData, cb?: () => void): void {
  let acc = get(active_account);
  if (!acc) return;

  log.debug('setMessageSeen', message);
  deleteNotification(messageNotificationId(message));
  message.just_marked_as_seen = true;
  sendData(acc, null, 'message_seen', { uid: message.uid }, true, (req, res) => {
    if (res.error !== false) {
      console.error('this is bad.');
      return;
    }
    if (cb) cb();
  });
}

export function sendMessage(
  text: string,
  format: string,
  acc?: Account | null,
  conversation?: ConversationData | null
): void {
  acc = acc ?? get(active_account);
  conversation = conversation ?? get(selectedConversation);

  if (!acc || !conversation) return;

  let message = new Message(acc, {
    uid: getGuid(),
    address_from: acc.credentials.address,
    address_to: conversation.address,
    message: text,
    format,
    created: new Date(),
    just_sent: true,
  });

  let params = {
    address: message.address_to,
    message: message.message,
    format,
    uid: message.uid,
  };

  saveAndSendOutgoingMessage(acc, conversation, params, message);

  const _selectedConversation = get(selectedConversation);
  if (_selectedConversation && _selectedConversation.id === conversation.id) {
    addMessagesToMessagesArray([message], 'send_message', false);
  }

  updateConversationsArray(acc, message);
}

export async function deleteMessage(message: MessageData): Promise<void> {
  console.log('123 deleteMessage', message);
  const acc = get(active_account);
  if (!acc) return;

  const params = {
    id: message.id,
    uid: message.uid,
  };
  sendData(acc, null, 'message_delete', params, true, (req, res) => {
    console.log('123 response', res);
    snipeMessage(message.uid);
  });
}

async function saveAndSendOutgoingMessage(
  acc: Account,
  conversation: ConversationData,
  params: any,
  message: MessageData
): Promise<void> {
  let outgoing_message_id = await messages_db.outgoing.add({ account: acc.id, data: params });
  sendOutgoingMessage(acc, conversation, params, message, outgoing_message_id);
}

function sendOutgoingMessage(
  acc: Account,
  conversation: ConversationData,
  params: any,
  message: MessageData,
  outgoing_message_id: number
): void {
  sendData(acc, null, 'message_send', params, true, (req, res) => {
    if (res.error !== false) {
      return;
    }
    messages_db.outgoing.delete(outgoing_message_id);
    message.received_by_my_homeserver = true;
    if (get(active_account) === acc && get(acc.module_data[identifier].selectedConversation) === conversation) {
      messagesArray.update((v) => v);
      insertEvent({ type: 'properties_update', array: get(messagesArray) });
    }
  });
}

export function modifyMessageReaction(
  messageUid: string,
  operation: 'set' | 'unset',
  reaction: any,
  acc?: Account | null
): Promise<any> {
  const activeAcc = get(active_account);
  acc = acc ?? activeAcc;
  if (!acc) return Promise.reject(new Error('No active account'));

  return new Promise((resolve, reject) => {
    const params = {
      messageUid,
      operation,
      reaction,
    };
    sendData(acc, null, 'message_reaction', params, true, (req, res) => {
      console.log('message_reaction res', res);
      if (res.error !== false) {
        reject(res);
        return;
      }
      resolve(res);
    });
  });
}

export function setMessageReaction(message: MessageData, reaction: any): Promise<any> {
  return modifyMessageReaction(message.uid, 'set', reaction);
}

export function unsetMessageReaction(message: MessageData, reaction: any): Promise<any> {
  return modifyMessageReaction(message.uid, 'unset', reaction);
}

export function toggleMessageReaction(message: MessageData, reaction: any): Promise<any> {
  const acc = get(active_account);
  if (!acc) return Promise.reject(new Error('No active account'));

  const userAddress = acc.credentials.address;
  const didUserReact = message.reactions?.some((existingReaction) => {
    if (
      existingReaction.user_address === userAddress &&
      existingReaction.emoji_codepoints_rgi === reaction.emoji_codepoints_rgi
    ) {
      return true;
    }
  });

  if (didUserReact && message.reactions) {
    message.reactions = message.reactions.filter(
      (r) => !(r.user_address === userAddress && r.emoji_codepoints_rgi === reaction.emoji_codepoints_rgi)
    );
    insertEvent({ type: 'properties_update', array: get(messagesArray) });
    return unsetMessageReaction(message, reaction);
  } else {
    const tempReaction = makeMessageReaction({
      user_address: userAddress,
      message_uid: message.uid,
      emoji_codepoints_rgi: reaction.emoji_codepoints_rgi,
    });
    if (!message.reactions) message.reactions = [];
    message.reactions.push(tempReaction);
    insertEvent({ type: 'properties_update', array: get(messagesArray) });
    return setMessageReaction(message, reaction);
  }
}

async function sendOutgoingMessages(acc: Account): Promise<void> {
  console.log('sendOutgoingMessages for acc', acc.id);
  for (const message of await messages_db.outgoing.where('account').equals(acc.id).toArray()) {
    console.log('sendOutgoingMessages found queued message:', message.data.uid);
    let res = await new Promise((resolve) => {
      sendData(acc, null, 'message_send', message.data, true, (req, res) => {
        resolve(res);
      });
    });
    if ((res as any).error !== false) {
      console.log('Temporary error while sending message ' + message.id + ': ' + (res as any).message);
      return;
    }
    console.log('sendOutgoingMessages queued message sent:', message.data.uid);
    await messages_db.outgoing.delete(message.id);
  }
}

function updateConversationsArray(acc: Account, msg: MessageData): void {
  let acc_ca = acc.module_data[identifier].conversationsArray;
  let ca = get(acc_ca) as ConversationData[];
  const conversation = ca.find((c) => c.address === msg.remote_address);
  let is_unread = !msg.seen && !msg.just_sent && msg.address_from !== acc.credentials.address;
  if (conversation) {
    conversation.last_message_date = msg.created;
    conversation.last_message_text = msg.stripped_text;
    if (is_unread) conversation.unread_count = (conversation.unread_count || 0) + 1;
    const index = ca.indexOf(conversation);
    ca.splice(index, 1);
    ca.unshift(conversation);
  } else {
    let newConversation: ConversationData = {
      acc,
      address: msg.remote_address || '',
      last_message_date: msg.created,
      last_message_text: msg.stripped_text,
      visible_name: null,
      unread_count: is_unread ? 1 : 0,
    };
    ca.unshift(newConversation);
  }
  acc_ca.set(ca);
}

export function openNewConversation(address: string): void {
  console.log('openNewConversation', address);
  const acc = get(active_account);
  if (acc) {
    selectConversation({ acc: new WeakRef(acc), address });
  }
}

export function jumpToMessage(acc: Account, address: string, uid: string): void {
  loadMessages(acc, address, 'uid:' + uid, 10, 10, 'load_referenced_message', (res) => {
    const message = get(messagesArray).find((m) => m.uid === uid);
    insertEvent({
      type: 'jump_to_referenced_message',
      array: get(messagesArray),
      referenced_message: message,
    });
  });
}

export function insertEvent(event: MessageEvent): void {
  events.update((v) => {
    console.log('insertEvent: ', v, event);
    return [...v, event];
  });
}

async function eventNewMessage(acc: Account, event: CustomEvent): Promise<void> {
  const res = event.detail;
  if (!res.data) return;
  let msg = new Message(acc, res.data);
  msg.received_by_my_homeserver = true;
  let sc = get(selectedConversation);
  if (msg.address_from !== acc.credentials.address) {
    console.log(
      'showNotification?: !get(isClientFocused): ',
      !get(isClientFocused),
      'get(active_account) != acc:',
      get(active_account) != acc,
      'msg.address_from !== sc?.address:',
      msg.address_from !== sc?.address
    );
    if (!get(isClientFocused) || get(active_account) != acc || msg.address_from !== sc?.address)
      await showNotification(acc, msg);
  }
  updateConversationsArray(acc, msg);
  if (acc !== get(active_account)) return;
  if (
    (msg.address_from === sc?.address && msg.address_to === acc.credentials.address) ||
    (msg.address_from === acc.credentials.address && msg.address_to === sc?.address)
  ) {
    addMessagesToMessagesArray([msg], 'new_message', false);
  }
}

function eventSeenMessage(acc: Account, event: CustomEvent): void {
  console.log(event);
  const res = event.detail;
  log.debug('eventSeenMessage', res);
  if (!res.data) {
    console.log('eventSeenMessage: no data');
    return;
  }
  deleteNotification(messageNotificationId(res.data.uid));
  if (acc !== get(active_account)) {
    return;
  }
  const message = get(messagesArray).find((m) => m.uid === res.data.uid);
  if (message) {
    message.seen = res.data.seen;
    messagesArray.update((v) => v);
    insertEvent({ type: 'properties_update', array: get(messagesArray) });
  } else console.log('eventSeenMessage: message not found by uid:', res);
}

function eventSeenInboxMessage(acc: Account, event: CustomEvent): void {
  if (acc !== get(active_account)) return;
  const res = event.detail;
  if (!res.data) return;
  const conversation = get(conversationsArray).find((c) => c.address === res.data.address_from);
  if (conversation && conversation.unread_count) {
    conversation.unread_count--;
    conversationsArray.update((v) => v);
  } else console.log('eventSeenInboxMessage: conversation not found by address:', res);
}

function messageNotificationId(msg: MessageData | { uid: string }): string {
  return identifier + '\\' + 'message\\' + msg.uid;
}

async function showNotification(acc: Account, msg: MessageData): Promise<void> {
  if (!acc) console.error('showNotification: no account');
  console.log('showNotification conversationsArray:', get(conversationsArray));
  const conversation = get(conversationsArray)?.find((c) => c.address === msg.address_from);
  console.log('new Notification in conversation', conversation);
  let title: string;
  if (conversation) {
    title = 'New message from: ' + conversation.visible_name + ' (' + msg.address_from + ')';
  } else {
    title = 'New message from: ' + msg.address_from;
  }
  let notification: YellowNotification = {
    id: messageNotificationId(msg),
    ts: Date.now(),
    title,
    body: get(hideMessageTextInNotifications) ? 'You have a new message' : msg.stripped_text || '',
    icon: 'img/photo.svg',
    sound: 'modules/' + identifier + '/audio/message.mp3',
    callback: async (event: string) => {
      if (event === 'click') {
        window.focus();
        selectAccount(acc.id);
        selected_corepage_id.set(null);
        selected_module_id.set(identifier);
        await tick();
        console.log('notification click: selectConversation', msg.address_from);
        selectConversation({
          acc: new WeakRef(acc),
          address: msg.address_from,
          visible_name: conversation?.visible_name,
        });
      }
    },
  };
  addNotification(notification);
}

export function ensureConversationDetails(conversation: ConversationData): void {
  if (conversation.visible_name) return;
  let acc = get(active_account);
  if (!acc) return;

  _send(
    acc,
    null,
    'core',
    'user_userinfo_get',
    { address: conversation.address },
    true,
    (_req, res) => {
      if (res.error !== false) return;
      Object.assign(conversation, res.data);
      conversationsArray.update((v) => v);
    },
    false
  );
}

DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
  if (node.tagName === 'IMAGED' || node.tagName === 'YELLOWVIDEO' || node.tagName === 'YELLOWAUDIO') {
    if (data.attrName === 'file' && data.attrValue.startsWith('yellow:')) {
      data.forceKeepAttr = true;
    }
  }
});

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
  if (node.tagName === 'VIDEO') node.removeAttribute('autoplay');
});

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName) {
    const t = data.tagName.toLowerCase();
    if (CUSTOM_TAGS.find((tag) => tag === t)) {
      while (node.firstChild) {
        node.parentNode?.insertBefore(node.firstChild, node.nextSibling);
      }
    }
  }
});

const CUSTOM_TAGS = [
  'sticker',
  'gif',
  'emoji',
  'attachment',
  'attachmentswrapper',
  'imageswrapper',
  'imaged',
  'yellowvideo',
  'yellowaudio',
  'reply',
];

export function saneHtml(content: string): DocumentFragment {
  let sane = DOMPurify.sanitize(content, {
    ADD_TAGS: CUSTOM_TAGS,
    ADD_ATTR: ['file', 'set', 'alt', 'codepoints', 'id'],
    RETURN_DOM_FRAGMENT: true,
  });
  return sane;
}

export function htmlEscape(str: string): string {
  return str
    .replaceAll(/&/g, '&amp;')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;')
    .replaceAll(/"/g, '&quot;')
    .replaceAll(/'/g, '&#039;');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '');
}

export function processMessage(message: MessageData): ProcessedMessage {
  let html: DocumentFragment;
  if (message.format === 'html') {
    html = saneHtml(message.message);

    wrapConsecutiveElements(html, 'Attachment', 'AttachmentsWrapper');
    wrapConsecutiveElements(html, 'Imaged', 'ImagesWrapper', 1);
    wrapConsecutiveElements(html, 'YellowVideo', 'VideosWrapper', 1);
    wrapConsecutiveElements(html, 'YellowAudio', 'AudioWrapper', 1);
  } else {
    let text = preprocess_incoming_plaintext_message_text(message.message);
    html = saneHtml(text);
  }
  return {
    format: 'html',
    body: html,
  };
}

// TODO: Implement group_downloads functionality if needed
// function group_downloads(html: DocumentFragment): DocumentFragment {
//   return group_downloads_walk(html);
// }

// function group_downloads_walk(node: Node): Node {
//   if (node.nodeType === Node.TEXT_NODE) return node;
//   if (node.nodeType === Node.ELEMENT_NODE) {
//     const element = node as Element;
//     if (element.tagName === 'DOWNLOAD') {
//       let group = document.createElement('DOWNLOADGROUP');
//       group.appendChild(node);
//       while (node.nextSibling && (node.nextSibling as Element).tagName === 'DOWNLOAD') {
//         group.appendChild(node.nextSibling);
//         node = node.nextSibling;
//       }
//       return group;
//     }
//     let clone = node.cloneNode() as Element;
//     for (let child of Array.from(node.childNodes)) {
//       clone.appendChild(group_downloads_walk(child));
//     }
//     return clone;
//   }
//   return node;
// }

export function preprocess_incoming_plaintext_message_text(content: string): string {
  let result0 = content;
  let result1 = splitAndLinkify(result0);
  let result2 = result1.map((part: LinkifyResult) => {
    if (part.type === 'plain') {
      let r = htmlEscape(part.value);
      r = r.replaceAll('\n', '<br />');
      r = replaceEmojisWithTags(r);
      return r;
    } else if (part.type === 'processed') return part.value;
  });
  let result3 = result2.join('');
  return result3;
}

// function emoji_cluster_to_array(cluster: string): number[] {
//   const codepoints: number[] = [];
//   for (const char of cluster) {
//     const codepoint = char.codePointAt(0);
//     if (codepoint !== undefined) {
//       codepoints.push(codepoint);
//     }
//   }
//   return codepoints;
// }

// function linkify(text: string): string {
//   const combinedPattern = new RegExp(
//     [
//       "(https?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)",
//       "(ftps?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)",
//       '(bitcoin:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)',
//       '(ethereum:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)',
//       '(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
//       '(tel:\\+?[0-9]{1,15})',
//     ].join('|'),
//     'g'
//   );
//   let result = text.replace(combinedPattern, (match) => {
//     return `<a href="${match}" target="_blank">${match}</a>`;
//   });
//   return result;
// }
