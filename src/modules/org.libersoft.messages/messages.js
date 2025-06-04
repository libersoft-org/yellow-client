import { replaceEmojisWithTags } from './emojis.js';
import { get, writable } from 'svelte/store';
import DOMPurify from 'dompurify';
import { log } from '@/core/tauri.ts';
import fileUploadManager from '@/org.libersoft.messages/services/Files/FileUploadService.ts';
import { FileUploadRecordStatus, FileUploadRecordType } from '@/org.libersoft.messages/services/Files/types.ts';
import fileDownloadManager from '@/org.libersoft.messages/services/Files/FileDownloadService.ts';
import fileUploadStore from '@/org.libersoft.messages/stores/FileUploadStore.ts';
import fileDownloadStore from '@/org.libersoft.messages/stores/FileDownloadStore.ts';
import { wrapConsecutiveElements } from './utils/htmlUtils.ts';
import { splitAndLinkify } from './splitAndLinkify';
import { base64ToUint8Array, makeFileUpload, transformFilesForServer } from '@/org.libersoft.messages/services/Files/utils.ts';
import { active_account, active_account_id, active_account_module_data, getGuid, hideSidebarMobile, isClientFocused, relay, selectAccount, selected_corepage_id, selected_module_id, send } from '@/core/core.ts';
import { localStorageSharedStore } from '../../lib/svelte-shared-store.ts';
import retry from 'retry';
import { tick } from 'svelte';
import { messages_db } from './db.ts';
import filesDB, { LocalFileStatus } from '@/org.libersoft.messages/services/LocalDB/FilesLocalDB.ts';
import { addNotification, deleteNotification } from '@/core/notifications.ts';
import { makeMessageReaction } from './factories/messageFactories.ts';

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

class Message {
	constructor(acc, data) {
		Object.assign(this, data);
		this.acc = new WeakRef(acc);
		this.stripped_text = stripHtml(this.message);
		//console.log('Message address_from: ' + this.address_from + ' acc:' + acc.credentials.address);
		this.is_outgoing = this.address_from === acc.credentials.address;
		if (this.address_to === acc.credentials.address) this.remote_address = this.address_from;
		else this.remote_address = this.address_to;
	}
}

export function initData(acc) {
	console.log('initData', acc);
	let result = {
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
	//start_emojisets_fetch(acc, result.emojisLoading, result.emojiGroups, result.emojisByCodepointsRgi);
	return result;
}

function sendData(acc, account, command, params = {}, sendSessionID = true, callback = null, quiet = false) {
	/*
     acc: account object
     account: account store, optional, for debugging
      */
	return _send(acc, account, identifier, command, params, sendSessionID, callback, quiet);
}

function _send(acc, account, target, command, params, sendSessionID, callback, quiet) {
	let cb = (req, res) => {
		if (res.error !== false) {
			if (get(acc.module_data[identifier].online) === false) {
				return;
			}
		}
		if (callback) callback(req, res);
	};
	return send(acc, account, target, command, params, sendSessionID, cb, quiet);
}

export function onModuleSelected(selected) {
	//console.log(identifier + ' onModuleSelected', selected);
	if (!selected) get(md)?.['selectedConversation']?.set(null);
}

export function selectConversation(conversation) {
	console.log('SELECTcONVERSATION conversation:', conversation, 'conversation.acc:', conversation.acc, 'conversation.acc?.deref:', conversation.acc?.deref);
	selectedConversation.set(conversation);
	events.set([]);
	messagesArray.set([]);
	insertEvent({ type: 'select_conversation', array: get(messagesArray) });
	hideSidebarMobile.set(true);
	listMessages(conversation.acc.deref ? conversation.acc.deref() : conversation.acc, conversation.address);
}

export function listConversations(acc) {
	sendData(acc, null, 'conversations_list', null, true, (_req, res) => {
		if (res.error !== false) {
			console.error('this is bad.');
			return;
		}
		if (res.data?.conversations) {
			let conversationsArray = acc.module_data[identifier].conversationsArray;
			console.log('listConversations into:', get(conversationsArray));
			conversationsArray.set(res.data.conversations.map(c => sanitizeConversation(acc, c)));
			console.log('listConversations:', get(conversationsArray));
		}
	});
}

function sanitizeConversation(acc, c) {
	c.acc = new WeakRef(acc);
	c.last_message_text = stripHtml(c.last_message_text);
	return c;
}

function moduleEventSubscribe(acc, event_name) {
	sendData(acc, null, 'subscribe', { event: event_name }, true, (req, res) => {
		if (res.error !== false) {
			console.error('this is bad.');
			window.alert('Communication with server Error while subscribing to event: ' + res.message);
		}
	});
}

export function initComms(acc) {
	// console.warn('init comms', acc);
	// message events
	moduleEventSubscribe(acc, 'new_message');
	moduleEventSubscribe(acc, 'seen_message');
	moduleEventSubscribe(acc, 'seen_inbox_message');
	moduleEventSubscribe(acc, 'message_update');

	// file transfer events
	moduleEventSubscribe(acc, 'upload_update');
	moduleEventSubscribe(acc, 'ask_for_chunk');

	let data = acc.module_data[identifier];
	//console.log('initComms:', data);

	data.new_message_listener = async event => eventNewMessage(acc, event);
	data.seen_message_listener = event => eventSeenMessage(acc, event);
	data.seen_inbox_message_listener = event => eventSeenInboxMessage(acc, event);

	// message events
	acc.events.addEventListener('new_message', data.new_message_listener);
	acc.events.addEventListener('seen_message', data.seen_message_listener);
	acc.events.addEventListener('seen_inbox_message', data.seen_inbox_message_listener);
	acc.events.addEventListener('message_update', message_update);

	// file transfer events
	acc.events.addEventListener('upload_update', upload_update);
	acc.events.addEventListener('ask_for_chunk', ask_for_chunk);

	refresh(acc);
}

export function init() {
	let subs = [];

	subs.push(
		active_account_id.subscribe(acc => {
			get(md)?.['selectedConversation']?.set(null);
		})
	);

	return function () {
		subs.forEach(sub => sub());
	};
}

async function refresh(acc) {
	console.log('refresh sendQueuedMessages...', acc);
	await sendOutgoingMessages(acc);
	if (get(acc.module_data[identifier].selectedConversation)) {
		console.log('refresh listMessages...', acc);
		listMessages(acc, get(acc.module_data[identifier].selectedConversation).address);
	}
	console.log('refresh listConversations...', acc);
	listConversations(acc);
}

export async function initUpload(files, uploadType, recipients) {
	console.log('2222', files, uploadType, recipients);
	const acc = get(active_account);
	try {
		files = await transformFilesForServer(files);
	} catch (error) {
		console.error('Error transforming files for server:', error);
	}
	console.log('3333');
	const { uploads } = fileUploadManager.beginUpload(files, uploadType, acc, {
		chunkSize: get(uploadChunkSize),
	});
	console.log('uploads', uploads);
	const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
	const acceptedAudioTypes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/webm'];
	const acceptedImageTypes = [
		'image/jpeg', // .jpg, .jpeg
		'image/png', // .png
		'image/gif', // .gif
		'image/webp', // .webp
		'image/avif', // .avif (modern browsers)
		'image/svg+xml', // .svg
		'image/x-icon', // .ico
		'image/bmp', // .bmp
	];

	// send message
	let messageHtml = '';
	uploads.forEach(upload => {
		const fileMimeType = upload.record.fileMimeType;
		const isServerType = upload.record.type === FileUploadRecordType.SERVER;

		// handle images
		if (isServerType && acceptedImageTypes.some(v => fileMimeType.startsWith(v))) {
			messageHtml += `<Imaged file="yellow:${upload.record.id}"></Imaged>`;
			filesDB.addFile({
				localFileStatus: LocalFileStatus.READY,
				fileTransferId: upload.record.id,
				fileOriginalName: upload.record.fileOriginalName,
				fileMimeType: upload.record.fileMimeType,
				fileSize: upload.record.fileSize,
				fileBlob: new Blob([upload.file], { type: fileMimeType }),
			});
		}
		// handle videos
		else if (isServerType && acceptedVideoTypes.some(v => fileMimeType.startsWith(v))) {
			messageHtml += `<YellowVideo file="yellow:${upload.record.id}"></YellowVideo>`;
		}
		// handle audio
		else if (isServerType && acceptedAudioTypes.some(v => fileMimeType.startsWith(v))) {
			messageHtml += `<YellowAudio file="yellow:${upload.record.id}"></YellowAudio>`;
		} else {
			messageHtml += `<Attachment id="${upload.record.id}"></Attachment>`;
		}
	});
	console.log('messageHtml', messageHtml);
	setTimeout(() => {
		sendMessage(messageHtml, 'html');
	}, 100);

	// send upload
	const records = uploads.map(upload => upload.record);
	sendData(acc, null, 'upload_begin', { records, recipients }, true, (req, res) => {
		if (res.error !== false) {
			return;
		}
		if (uploads?.[0].record.type === FileUploadRecordType.SERVER) {
			fileUploadManager.startUploadSerial(res.allowedRecords, uploadChunkAsync);
		} else {
			console.error('Error starting upload'); // TODO: better error
		}
	});
}

function uploadChunkAsync({ upload, chunk }) {
	return new Promise((resolve, reject) => {
		const op = retry.operation({
			retries: 3,
			factor: 1.5,
			minTimeout: 1000,
			maxTimeout: 3000,
		});

		op.attempt(() => {
			const retry = res => {
				const willRetry = op.retry(new Error());
				if (!willRetry) {
					reject(res);
				}
			};
			const to = setTimeout(() => {
				retry();
			}, 5000); // TODO: maybe longer
			sendData(upload.acc, null, 'upload_chunk', { chunk }, true, (req, res) => {
				clearTimeout(to);
				if (res.error !== false) {
					retry(res);
					return;
				}
				resolve();
			});
		});
	});
}

function ask_for_chunk(event) {
	const { uploadId, offsetBytes, chunkSize } = event.detail.data;
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

function message_update(event) {
	const { type, message } = event.detail.data;
	console.log('message_update', event.detail.data);

	if (type === 'reaction') {
		const messageUid = message.uid;

		// TODO: this messagesArray.update will try to find the message in the current conversation (even if this update is from another conversation)
		messagesArray.update(m => {
			const foundMessage = m.find(msg => msg.uid === messageUid);
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

function upload_update(event) {
	const { record, uploadData } = event.detail.data;
	const currentUpload = fileUploadStore.get(record.id);
	if (currentUpload) {
		if (currentUpload.file && [FileUploadRecordStatus.UPLOADING, FileUploadRecordStatus.BEGUN, FileUploadRecordStatus.PAUSED].includes(record.status)) {
			// pass
			// this is simple approach how to ignore status updates that are produced by sender because server does not know
			// from which tab the upload is being issued we detect sender tab by existence of currentUpload.file
			// in future if we want more sophisticated approach we can use session storage to store sender tab id
		} else {
			fileUploadStore.patch(record.id, { record, ...uploadData });
		}
	}
	const currentDownload = fileDownloadStore.get(record.id);
	if (currentDownload) {
		fileDownloadStore.patch(record.id, { record });
	}
}

export function downloadAttachmentsSerial(records, finishCallback) {
	const acc = get(active_account);
	// const records = recordIds.map(id => fileDownloadStore.get(id).record);
	return fileDownloadManager.startDownloadSerial(records, makeDownloadChunkAsyncFn(acc), finishCallback);
}

export const makeDownloadChunkAsyncFn =
	acc =>
	({ uploadId, offsetBytes, chunkSize }) => {
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
						chunkSize, // TODO: take this value from server
						offsetBytes, // TODO: take this value from server
						data: await base64ToUint8Array(res.chunk.data),
					},
				}); // TODO: better typing (whole function)
			});
		});
	};

export function cancelUpload(uploadId) {
	fileUploadManager.cancelUpload(uploadId);
	sendData(get(active_account), null, 'upload_cancel', { uploadId }, true, (req, res) => {});
}

export function pauseUpload(uploadId) {
	return new Promise(resolve => {
		fileUploadManager.pauseUpload(uploadId);
		sendData(
			get(active_account),
			null,
			'upload_update_status',
			{
				uploadId,
				status: FileUploadRecordStatus.PAUSED,
			},
			true,
			(req, res) => {
				resolve(); // TODO: handle error if needed
			}
		);
	});
}

export function resumeUpload(uploadId) {
	return new Promise(resolve => {
		fileUploadManager.resumeUpload(uploadId);
		sendData(
			get(active_account),
			null,
			'upload_update_status',
			{
				uploadId,
				status: FileUploadRecordStatus.UPLOADING,
			},
			true,
			(req, res) => {
				resolve(); // TODO: handle error if needed
			}
		);
	});
}

export function pauseDownload(uploadId) {
	fileDownloadManager.pauseDownload(uploadId);
}

export function resumeDownload(uploadId) {
	fileDownloadManager.resumeDownload(uploadId);
}

export function cancelDownload(uploadId) {
	const download = fileDownloadStore.get(uploadId);
	if (!download) {
		return;
	}
	if (download.record.type === FileUploadRecordType.P2P) {
		// for p2p we want to cancel download but we gonna still use the same logic as is used in cancel upload because this is global cancel
		// TODO: in case of more then one recipient we should cancel only for one recipient locally
		cancelUpload(uploadId);
	} else if (download.record.type === FileUploadRecordType.SERVER) {
		fileDownloadManager.cancelDownload(uploadId);
	}
}

export function loadUploadData(uploadId) {
	return new Promise((resolve, reject) => {
		const existingUpload = fileUploadStore.get(uploadId);
		if (existingUpload) {
			resolve(existingUpload);
			return;
		}

		let acc = get(active_account);

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

export function deinitComms(acc) {
	sendData(acc, null, 'user_unsubscribe', { event: 'new_message' });
	sendData(acc, null, 'user_unsubscribe', { event: 'seen_message' });
	sendData(acc, null, 'user_unsubscribe', { event: 'seen_inbox_message' });
	sendData(acc, null, 'user_unsubscribe', { event: 'upload_update' });
	sendData(acc, null, 'user_unsubscribe', { event: 'ask_for_chunk' });
}

export function deinitData(acc) {
	console.log('DEINIT DATA');
	let data = acc.module_data[identifier];
	if (!data) return;

	// message events
	acc.events.removeEventListener('new_message', data.new_message_listener);
	acc.events.removeEventListener('seen_message', data.seen_message_listener);
	acc.events.removeEventListener('seen_inbox_message', data.seen_message_listener);

	// file transfer events
	acc.events.removeEventListener('upload_update', upload_update);
	acc.events.removeEventListener('ask_for_chunk', ask_for_chunk);

	data.online.set(false);
	data.events.set([]);
	data.messagesArray.set([]);
	data.conversationsArray.set([]);
	data.selectedConversation.set(null);
	acc.module_data[identifier] = null;
}

export function listMessages(acc, address) {
	//console.log('listMessages', acc, address);
	messagesArray.set([{ type: 'initial_loading_placeholder' }]);
	messagesIsInitialLoading.set(true);
	loadMessages(acc, address, 'unseen', 3, 3, 'initial_load', res => {});
}

export function loadMessages(acc, address, base, prev, next, reason, cb, force_refresh = false) {
	/* acc: account object
     address: contact address (identifies conversation)
     base: message id
     prev: number of messages to load before base
     next: number of messages to load after base
     reason: reason for loading messages (for debugging)
     cb: callback (optional)
      */
	console.log('reason', reason, 'force_refresh', force_refresh);
	return sendData(acc, null, 'messages_list', { address: address, base, prev, next }, true, (_req, res) => {
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

export function findMessages(acc, address, base, prev, next) {
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

export function getMessageByUid(uid) {
	return new Promise((resolve, reject) => {
		const found = get(messagesArray).find(m => m.uid === uid);
		if (found) {
			resolve(found);
			return;
		}
		const acc = get(active_account);
		const address = get(selectedConversation).address; // TODO: won't work for multi conversations
		findMessages(acc, address, 'uid:' + uid, 0, 0)
			.then(messages => {
				const message = messages.find(m => m.uid === uid);
				resolve(message);
			})
			.catch(reject);
	});
}

function addMessagesToMessagesArray(items, reason, force_refresh) {
	let arr = get(messagesArray);
	arr = arr.filter(m => m.type !== 'initial_loading_placeholder');
	let result = [];
	let state = { countAdded: 0 };
	for (let m of items) {
		result.push(addMessage(arr, m, state));
	}
	sortMessages(arr);
	addMissingPrevNext(arr);
	//console.log('messagesArray.set:', arr);
	messagesArray.set(arr);
	if (force_refresh || state.countAdded > 0) insertEvent({ type: reason, array: arr });
	else insertEvent({ type: 'properties_update', array: arr });
	return result;
}

export function handleResize(wasScrolledToBottom) {
	insertEvent({ type: 'resize', wasScrolledToBottom2: true });
}

export function snipeMessage(messageUid) {
	messagesArray.update(v => {
		return v.filter(m => m.uid !== messageUid);
	});
	insertEvent({ type: 'gc', array: get(messagesArray) });
}

function addMessage(arr, msg, state) {
	//TODO: this should only update the message if the data is actually more up-to-date
	let m = arr.find(m => m.uid === msg.uid);
	if (m) {
		for (let key in msg) m[key] = msg[key];
		return m;
	} else {
		arr.unshift(msg);
		state.countAdded++;
		return msg;
	}
}

function constructLoadedMessages(acc, data) {
	let items = data.map(msg => {
		let message = new Message(acc, msg);
		message.received_by_my_homeserver = true;
		message.is_lazyloaded = true;
		return message;
	});
	return items;
}

function sortMessages(messages) {
	messages.sort((a, b) => {
		//TODO: take care of just-sent messages, they don't have id yet
		//console.log(a.created, b.created);
		let akey = a.id;
		let bkey = b.id;
		if (akey === undefined && bkey === undefined) {
			akey = a.created;
			bkey = b.created;
		} else if (akey === undefined) return 1;
		else if (bkey === undefined) return -1;
		if (akey > bkey) return 1;
		if (akey < bkey) return -1;
		return 0;
	});
}

function addMissingPrevNext(messages) {
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

function findPrev(messages, i) {
	for (const m of messages) {
		if (m.next === i.id) return m.id;
	}
}

function findNext(messages, i) {
	for (const m of messages) {
		if (m.prev === i.id) return m.id;
	}
}

export function setMessageSeen(message, cb) {
	let acc = get(active_account);
	log.debug('setMessageSeen', message);
	deleteNotification(messageNotificationId(message));
	message.just_marked_as_seen = true;
	sendData(acc, active_account, 'message_seen', { uid: message.uid }, true, (req, res) => {
		if (res.error !== false) {
			console.error('this is bad.');
			return;
		}
		//message.seen = true;
		if (cb) cb();
		//messagesArray.update(v => v);
		// update conversationsArray:
		/*const conversation = get(conversationsArray).find(c => c.address === message.address_from);
          if (conversation) {
           conversation.unread_count--;
           conversationsArray.update(v => v);
          }*/
	});
}

export function sendMessage(text, format, acc = null, conversation = null) {
	acc = acc ? acc : get(active_account);
	conversation = conversation ? conversation : get(selectedConversation);

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

	// append to message array only when conversation is also selected (active)
	const _selectedConversation = get(selectedConversation);
	if (_selectedConversation && _selectedConversation.id === conversation.id) {
		addMessagesToMessagesArray([message], 'send_message');
	}

	updateConversationsArray(acc, message);
}

export async function deleteMessage(message) {
	console.log('123 deleteMessage', message);
	const acc = get(active_account);
	const params = {
		id: message.id,
		uid: message.uid,
	};
	sendData(acc, null, 'message_delete', params, true, (req, res) => {
		console.log('123 response', res);
		snipeMessage(message.uid);
	});
}

async function saveAndSendOutgoingMessage(acc, conversation, params, message) {
	let outgoing_message_id = await messages_db.outgoing.add({ account: acc.id, data: params });
	//console.log('saveAndSendOutgoingMessage saved message:', message.uid);
	sendOutgoingMessage(acc, conversation, params, message, outgoing_message_id);
}

function sendOutgoingMessage(acc, conversation, params, message, outgoing_message_id) {
	sendData(acc, null, 'message_send', params, true, (req, res) => {
		//console.log('sendOutgoingMessage res', res);
		if (res.error !== false) {
			return;
		}
		messages_db.outgoing.delete(outgoing_message_id); // update the message status and trigger the update of the messagesArray:
		message.received_by_my_homeserver = true;
		if (get(active_account) === acc && get(acc.module_data[identifier].selectedConversation) === conversation) {
			messagesArray.update(v => v);
			insertEvent({ type: 'properties_update', array: get(messagesArray) });
		}
	});
}

/**
 * @param acc
 * @param messageUid
 * @param operation {'set'|'unset'}
 * @returns {Promise<unknown>}
 */
export function modifyMessageReaction(messageUid, operation, reaction, acc) {
	acc = acc ? acc : get(active_account);
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

export function setMessageReaction(message, reaction) {
	return modifyMessageReaction(message.uid, 'set', reaction);
}

export function unsetMessageReaction(message, reaction) {
	return modifyMessageReaction(message.uid, 'unset', reaction);
}

export function toggleMessageReaction(message, reaction) {
	const userAddress = get(active_account).credentials.address;
	const didUserReact = message.reactions.some(existingReaction => {
		if (existingReaction.user_address === userAddress && existingReaction.emoji_codepoints_rgi === reaction.emoji_codepoints_rgi) {
			return true;
		}
	});

	if (didUserReact) {
		message.reactions = message.reactions.filter(r => !(r.user_address === userAddress && r.emoji_codepoints_rgi === reaction.emoji_codepoints_rgi));
		insertEvent({ type: 'properties_update', array: get(messagesArray) });
		return unsetMessageReaction(message, reaction);
	} else {
		const tempReaction = makeMessageReaction({
			user_address: userAddress,
			message_uid: message.uid,
			emoji_codepoints_rgi: reaction.emoji_codepoints_rgi,
		});
		message.reactions.push(tempReaction);
		insertEvent({ type: 'properties_update', array: get(messagesArray) });
		return setMessageReaction(message, reaction);
	}
}

async function sendOutgoingMessages(acc) {
	/* try to send outgoing messages. Ensure they are sent in creation order. Break on error */
	console.log('sendOutgoingMessages for acc', acc.id);
	for (const message of await messages_db.outgoing.where('account').equals(acc.id).toArray()) {
		console.log('sendOutgoingMessages found queued message:', message.data.uid);
		let res = await new Promise(resolve => {
			sendData(acc, active_account, 'message_send', message.data, true, (req, res) => {
				resolve(res);
			});
		});
		if (res.error !== false) {
			console.log('Temporary error while sending message ' + message.id + ': ' + res.message);
			return;
		}
		console.log('sendOutgoingMessages queued message sent:', message.data.uid);
		await messages_db.outgoing.delete(message.id);
	}
}

function updateConversationsArray(acc, msg) {
	let acc_ca = acc.module_data[identifier].conversationsArray;
	let ca = get(acc_ca);
	const conversation = ca.find(c => c.address === msg.remote_address);
	//console.log('updateConversationsArray', conversation, msg);
	let is_unread = !msg.seen && !msg.just_sent && msg.address_from !== acc.credentials.address;
	if (conversation) {
		conversation.last_message_date = msg.created;
		conversation.last_message_text = msg.stripped_text;
		if (is_unread) conversation.unread_count = (conversation.unread_count || 0) + 1;
		// shift the affected conversation to the top:
		const index = ca.indexOf(conversation);
		ca.splice(index, 1);
		ca.unshift(conversation);
	} else {
		let conversation = {
			acc,
			address: msg.remote_address,
			last_message_date: msg.created,
			last_message_text: msg.stripped_text,
			visible_name: null,
			unread_count: is_unread ? 1 : 0,
		};
		ca.unshift(conversation);
	}
	acc_ca.set(ca);
}

export function openNewConversation(address) {
	console.log('openNewConversation', address);
	selectConversation({ acc: new WeakRef(get(active_account)), address });
}

export function jumpToMessage(acc, address, uid) {
	loadMessages(acc, address, 'uid:' + uid, 10, 10, 'load_referenced_message', res => {
		const message = get(messagesArray).find(m => m.uid === uid);
		insertEvent({
			type: 'jump_to_referenced_message',
			array: get(messagesArray),
			referenced_message: message,
		});
	});
}

export function insertEvent(event) {
	events?.update(v => {
		console.log('insertEvent: ', v, event);
		return [...v, event];
	});
}

async function eventNewMessage(acc, event) {
	const res = event.detail;
	//console.log('eventNewMessage', acc, res);
	if (!res.data) return;
	let msg = new Message(acc, res.data);
	msg.received_by_my_homeserver = true;
	let sc = get(selectedConversation);
	if (msg.address_from !== acc.credentials.address) {
		console.log('showNotification?: !get(isClientFocused): ', !get(isClientFocused), 'get(active_account) != acc:', get(active_account) != acc, 'msg.address_from !== sc?.address:', msg.address_from !== sc?.address);
		if (!get(isClientFocused) || get(active_account) != acc || msg.address_from !== sc?.address) await showNotification(acc, msg);
	}
	//console.log('eventNewMessage updateConversationsArray with msg:', msg);
	updateConversationsArray(acc, msg);
	if (acc !== get(active_account)) return;
	if ((msg.address_from === sc?.address && msg.address_to === acc.credentials.address) || (msg.address_from === acc.credentials.address && msg.address_to === sc?.address)) {
		//let oldLen = get(messagesArray).length;
		msg = addMessagesToMessagesArray([msg], 'new_message')[0];
	}
}

function eventSeenMessage(acc, event) {
	console.log(event);
	const res = event.detail;
	log.debug('eventSeenMessage', res);
	if (!res.data) {
		console.log('eventSeenMessage: no data');
		return;
	}
	deleteNotification(messageNotificationId(res.data.uid));
	if (acc !== get(active_account)) {
		//console.log('eventSeenMessage: acc !== get(active_account)', acc, get(active_account));
		return;
	}
	//console.log('messagesArray:', get(messagesArray));
	const message = get(messagesArray).find(m => m.uid === res.data.uid);
	//console.log('eventSeenMessage: message found by uid:', message);
	if (message) {
		message.seen = res.data.seen;
		messagesArray.update(v => v);
		//console.log('insertEvent..');
		insertEvent({ type: 'properties_update', array: get(messagesArray) });
	} else console.log('eventSeenMessage: message not found by uid:', res);
}

function eventSeenInboxMessage(acc, event) {
	/*
      mark, as seen, a message sent to us. This can be triggered by another client.
     */
	if (acc !== get(active_account)) return;
	//console.log(event);
	const res = event.detail;
	//console.log('eventSeenInboxMessage', res);
	if (!res.data) return;
	//console.log(get(conversationsArray));
	const conversation = get(conversationsArray).find(c => c.address === res.data.address_from);
	if (conversation) {
		conversation.unread_count--;
		conversationsArray.update(v => v);
	} else console.log('eventSeenInboxMessage: conversation not found by address:', res);
}

function messageNotificationId(msg) {
	return identifier + '\\' + 'message\\' + msg.uid;
}

async function showNotification(acc, msg) {
	if (!acc) console.error('showNotification: no account');
	console.log('showNotification conversationsArray:', get(conversationsArray));
	const conversation = get(conversationsArray)?.find(c => c.address === msg.address_from);
	console.log('new Notification in conversation', conversation);
	let title;
	if (conversation) {
		title = 'New message from: ' + conversation.visible_name + ' (' + msg.address_from + ')';
	} else {
		title = 'New message from: ' + msg.address_from;
	}
	let notification = {
		id: messageNotificationId(msg),
		title,
		body: get(hideMessageTextInNotifications) ? 'You have a new message' : msg.stripped_text,
		icon: 'img/photo.svg',
		//icon: 'favicon.svg',
		sound: 'modules/' + identifier + '/audio/message.mp3',
		callback: async event => {
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

export function ensureConversationDetails(conversation) {
	//console.log('ensureConversationDetails', conversation);
	if (conversation.visible_name) return;
	let acc = get(active_account);
	//console.log('ensureConversationDetails acc:', acc);
	_send(acc, active_account, 'core', 'user_userinfo_get', { address: conversation.address }, true, (_req, res) => {
		if (res.error !== false) return;
		Object.assign(conversation, res.data);
		conversationsArray.update(v => v);
	});
}

DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
	if (node.tagName === 'IMAGED' || node.tagName === 'YELLOWVIDEO' || node.tagName === 'YELLOWAUDIO') {
		if (data.attrName === 'file' && data.attrValue.startsWith('yellow:')) {
			data.forceKeepAttr = true;
		}
	}
});

DOMPurify.addHook('afterSanitizeAttributes', function (node) {
	if (node.tagName === 'IMAGED') {
		// console.log('node 2', node);
	}
	if (node.tagName === 'A') {
		node.setAttribute('target', '_blank');
		node.setAttribute('rel', 'noopener noreferrer');
	}
	if (node.tagName === 'VIDEO') node.removeAttribute('autoplay');
});

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
	if (data.tagName) {
		const t = data.tagName.toLowerCase();
		if (CUSTOM_TAGS.find(tag => tag === t)) {
			// Move children out to after the node. This is a hack to tolerate improperly closed sticker tag. // nope, jsdom (parse5) already produces them "wrong" (right, by spec)
			while (node.firstChild) {
				node.parentNode.insertBefore(node.firstChild, node.nextSibling);
			}
		}
	}
});

const CUSTOM_TAGS = ['sticker', 'gif', 'emoji', 'attachment', 'attachmentswrapper', 'imageswrapper', 'imaged', 'yellowvideo', 'yellowaudio', 'reply'];

export function saneHtml(content) {
	//console.log('saneHtml:');
	let sane = DOMPurify.sanitize(content, {
		ADD_TAGS: CUSTOM_TAGS,
		//FORBID_CONTENTS: ['sticker'],
		ADD_ATTR: ['file', 'set', 'alt', 'codepoints', 'id'], // TODO: fixme, security issue, should only be allowed on the relevant elements
		RETURN_DOM_FRAGMENT: true,
	});
	/*
     console.log('content:', content);
     console.log(content);
     console.log('sane:');
     console.log(sane);
     */

	return sane;
}

export function htmlEscape(str) {
	//console.log('htmlEscape:', str);
	return str.replaceAll(/&/g, '&amp;').replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/"/g, '&quot;').replaceAll(/'/g, '&#039;');
}

export function stripHtml(html) {
	return html.replace(/<[^>]*>?/gm, '');
}

export function processMessage(message) {
	let html;
	if (message.format === 'html') {
		html = saneHtml(message.message);

		wrapConsecutiveElements(html, 'Attachment', 'AttachmentsWrapper');
		wrapConsecutiveElements(html, 'Imaged', 'ImagesWrapper', 1);
		wrapConsecutiveElements(html, 'YellowVideo', 'VideosWrapper', 1);
		wrapConsecutiveElements(html, 'YellowAudio', 'AudioWrapper', 1);
	} else {
		let text = preprocess_incoming_plaintext_message_text(message.message);
		//console.log('text:', text);
		html = saneHtml(text);
		//console.log('html:', html);
	}
	//html = group_downloads(html);
	//console.log('htmlhtmlhtml', html);
	return {
		format: 'html',
		body: html,
	};
}

function group_downloads(html) {
	// TODO: walk the dom tree, find runs of multiple Download elements, and group them under a single DownloadGroup element
	return group_downloads_walk(html);
}

function group_downloads_walk(node) {
	// TODO: review, autogenerated
	if (node.nodeType === Node.TEXT_NODE) return node;
	if (node.nodeType === Node.ELEMENT_NODE) {
		if (node.tagName === 'DOWNLOAD') {
			let group = document.createElement('DOWNLOADGROUP');
			group.appendChild(node);
			while (node.nextSibling && node.nextSibling.tagName === 'DOWNLOAD') {
				group.appendChild(node.nextSibling);
				node = node.nextSibling;
			}
			return group;
		}
		let clone = node.cloneNode();
		for (let child of node.childNodes) {
			clone.appendChild(group_downloads_walk(child));
		}
		return clone;
	}
}

export function preprocess_incoming_plaintext_message_text(content) {
	let result0 = content;
	//console.log('splitAndLinkify input:', result0);
	let result1 = splitAndLinkify(result0);
	//console.log('splitAndLinkify output:', result1);
	let result2 = result1.map(part => {
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

function emoji_cluster_to_array(cluster) {
	// Convert the emoji cluster to an array of codepoints
	const codepoints = [];
	for (const char of cluster) {
		codepoints.push(char.codePointAt(0));
	}
	return codepoints;
}

function linkify(text) {
	//console.log('linkify ', text);
	// Combine all patterns into one. We use non-capturing groups (?:) to avoid capturing groups we don't need.
	const combinedPattern = new RegExp(["(https?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", "(ftps?:\\/\\/(?:[a-zA-Z0-9-._~%!$&'()*+,;=]+(?::[a-zA-Z0-9-._~%!$&'()*+,;=]*)?@)?(?:[a-zA-Z0-9-]+\\.)*[a-zA-Z0-9-]+(?:\\.[a-zA-Z]{2,})?(?::\\d+)?(?:\\/[^\\s]*)?)", '(bitcoin:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(ethereum:[a-zA-Z0-9]+(?:\\?[a-zA-Z0-9&=]*)?)', '(mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})', '(tel:\\+?[0-9]{1,15})'].join('|'), 'g');
	let result = text.replace(combinedPattern, match => {
		// Directly use `match` as the URL/href. This ensures we handle all links in one pass.
		return `<a href="${match}" target="_blank">${match}</a>`;
	});
	//console.log('linkify result:', result);
	return result;
}
