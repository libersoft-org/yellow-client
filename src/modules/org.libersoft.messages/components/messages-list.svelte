<script>
 import { afterUpdate, beforeUpdate, onMount, setContext, tick } from 'svelte';
 import { getGuid, debug } from '../../../core/core.js';
 import Button from '../../../core/components/button.svelte';
 import Spinner from '../../../core/components/spinner.svelte';
 import Modal from '../../../core/components/modal.svelte';
 import ModalWithSlot from '../../../core/components/modal-with-slot.svelte';
 import ModalStickersetDetails from '../modals/stickerset-details.svelte';
 import Message from './message.svelte';
 import Loader from './loader.svelte';
 import ScrollButton from './scroll-button.svelte';
 import { messagesArray, events, insertEvent } from '../messages.js';
 import { get } from 'svelte/store';
 export let conversation;
 export let setBarFocus;
 let scrollButtonVisible = true;
 let showDebugModal = false;
 let messages_elem;
 let anchorElement;
 let oldLastID = null;
 let itemsCount = 0;
 let itemsArray = [];
 let loaders = [];
 let holes = [];
 let uiEvents = [];
 let stickersetDetailsModalStickerset;
 let showStickersetDetailsModal = false;
 let scrolledToBottom = true;
 let windowInnerWidth;
 let windowInnerHeight;

 $: scrollButtonVisible = !scrolledToBottom;
 $: updateWindowSize(windowInnerWidth, windowInnerHeight);

 function openStickersetDetailsModal(stickerset) {
  stickersetDetailsModalStickerset = stickerset;
  //console.log('openStickersetDetailsModal:', stickerset);
  showStickersetDetailsModal = true;
 }

 setContext('openStickersetDetailsModal', openStickersetDetailsModal);

 events.subscribe(e => {
  if (e?.length) {
   handleEvents(e);
   itemsCount = itemsArray.length;
   events.set([]);
  }
 });

 function saveScrollPosition(event) {
  if (!messages_elem) return;
  event.savedScrollTop = messages_elem.scrollTop;
  event.savedScrollHeight = messages_elem.scrollHeight;
  //console.log('saveScrollPosition: savedScrollTop:', event.savedScrollTop, 'savedScrollHeight:', event.savedScrollHeight);
 }

 function restoreScrollPosition(event) {
  //console.log('restoreScrollPosition messages_elem.scrollTop:', messages_elem.scrollTop, 'messages_elem.scrollHeight:', messages_elem.scrollHeight);
  const scrollDifference = messages_elem.scrollHeight - event.savedScrollHeight;
  messages_elem.scrollTop = event.savedScrollTop + scrollDifference;
  //console.log('scrollDifference:', scrollDifference, 'new messages_elem.scrollTop:', messages_elem.scrollTop);
 }

 function scrollToBottom() {
  // TODO: fixme: sometimes does not scroll to bottom properly when two messages appear at once
  //console.log('SCROLLTOBOTTOM');
  messages_elem.scrollTop = messages_elem.scrollHeight;
 }

 function isScrolledToBottom() {
  if (messages_elem) return checkIfScrolledToBottom(messages_elem);
 }

 function checkIfScrolledToBottom(div) {
  const result = div.scrollTop + div.clientHeight >= div.scrollHeight - 20;
  ///console.log('checkIfScrolledToBottom div.scrollTop:', div.scrollTop, 'div.clientHeight:', div.clientHeight, 'total:', div.scrollTop + div.clientHeight, 'div.scrollHeight:', div.scrollHeight, 'result:', result);
  return result;
 }

 function parseScroll(event) {
  scrolledToBottom = messages_elem?.scrollTop + messages_elem?.clientHeight >= messages_elem?.scrollHeight - 20;
 }

 function updateWindowSize(width, height) {
  //console.log('updateWindowSize width:', width, 'height:', height);
  parseScroll();
 }

 beforeUpdate(() => {
  if (!messages_elem) return;
  //console.log('beforeUpdate: messages_elem.scrollTop:', messages_elem.scrollTop, 'messages_elem.scrollHeight:', messages_elem.scrollHeight);
 });

 afterUpdate(async () => {
  if (!messages_elem) return;
  await tick();
  for (let event of uiEvents) {
   //console.log('uiEvent:', event);
   if (event.type === 'gc') {
    //console.log('gc');
   } else if (event.type === 'lazyload_prev') restoreScrollPosition(event);
   else if (event.type === 'lazyload_next') {
    //pass
   } else if (event.type === 'new_message') {
    if (event.wasScrolledToBottom) scrollToBottom();
   } else if (event.type === 'send_message') {
    if (event.wasScrolledToBottom) scrollToBottom();
   } else if (event.type === 'initial_load') scrollToBottom();
   else if (event.type === 'properties_update') {
    //console.log('properties_update');
   }
  }
  let events = [...uiEvents];
  uiEvents = [];
  await tick();
  let activatedCount = 0;
  for (let event of events) {
   //console.log('event:', event);
   for (let loader of event.loaders) {
    //console.log('activate loader:', loader);
    loader.active = true;
    activatedCount++;
   }
  }
  if (activatedCount > 0) {
   itemsArray = itemsArray;
   for (let i = 0; i < itemsArray.length; i++) itemsArray[i] = itemsArray[i];
  }
 });

 function getLoader(l) {
  loaders = loaders.filter(i => !i.delete_me);
  for (let i of loaders) {
   if (i.base === l.base && i.prev === l.prev && i.next === l.next) return i;
  }
  l.uid = getGuid();
  l.type = 'loader';
  l.conversation = conversation;
  loaders.push(l);
  return l;
 }

 function getHole(top, bottom) {
  let uid = top.uid + '_' + bottom.uid;
  for (let i of holes) {
   if (i.uid === uid) return i;
  }
  let hole = {
   type: 'hole',
   top: top,
   bottom: bottom,
   uid: uid,
  };
  holes.push(hole);
  top.hole_uid = hole.uid;
  bottom.hole_uid = hole.uid;
  return hole;
 }

 function gc() {
  //console.log('gc random slice of messagesArray...');
  let x = get(messagesArray);
  let i = Math.floor(Math.random() * x.length);
  x.splice(i, Math.floor(Math.random() * 40));
  messagesArray.set(x);
  insertEvent({ type: 'gc', array: get(messagesArray) });
 }

 async function handleEvents(events) {
  //console.log('handleEvents:', events);
  if (events.length === 1 && events[0].type === 'properties_update') {
   itemsArray = itemsArray;
   return;
  }

  for (let i = 0; i < events.length; i++) {
   //console.log('handleEvent:', events[i]);
   let event = events[i];
   event.loaders = [];
   uiEvents.push(event);
   saveScrollPosition(event);
   event.wasScrolledToBottom = isScrolledToBottom();
   if (i != events.length - 1) continue;
   if (event.type === 'resize') continue;
   if (event.array === undefined) return;
   let messages = event.array;
   if (messages.length === 1 && messages[0].type === 'initial_loading_placeholder') {
    loaders = [];
    holes = [];
    itemsArray = messages;
    return;
   }
   if (messages.length === 0) {
    itemsArray = [{ type: 'no_messages' }];
    return;
   }
   messages = mergeAuthorship(messages);
   for (let m of messages) {
    if (!m.acc || m.uid === undefined) {
     //(typeof m !== Message)
     console.log('getItems: Invalid item: ', typeof m, m);
     throw new Error('getItems: Invalid item: ' + JSON.stringify(m));
    }
   }
   // messages are sorted in correct order at this point.
   // add lazyloaders where there is discontinuity.
   let items = [];
   // add a loader at the top if first message is not the first message in the chat
   if (messages[0].prev !== 'none' && messages[0].id !== undefined) {
    let l = getLoader({ prev: 10, base: messages[0].id, reason: 'lazyload_prev' });
    event.loaders.push(l);
    items.unshift(l);
   }
   let unseen_marker_put = false;
   //scroll = isScrolledToBottom();
   // walk all messages, add loaders where there are discontinuities
   for (let i = 0; i < messages.length; i++) {
    let m = messages[i];
    //console.log('m:', m);
    //console.log('if (!unseen_marker_put && !m.is_outgoing && (!m.seen || m.just_marked_as_seen)):', !unseen_marker_put, !m.is_outgoing, !m.seen, m.just_marked_as_seen);
    if (!unseen_marker_put && !m.is_outgoing && (!m.seen || m.just_marked_as_seen)) {
     //console.log('ADDING-UNSEEN-MARKER');
     unseen_marker_put = true;
     items.push({ type: 'unseen_marker' });
    }
    items.push(m);
    if (m.id !== undefined && m.id > oldLastID) {
     oldLastID = m.id;
     if (m.is_lazyloaded) scroll = false;
    }
    let next = messages[i + 1];
    if (next && next.id !== undefined && m.next != 'none' && m.next != undefined && m.next !== next.id) {
     //console.log('INSERTING-HOLE-BETWEEN', m, 'and', next);
     //console.log(JSON.stringify(m), JSON.stringify(next));
     //console.log('m.next:', m.next, 'next.id:', next.id);
     let l1 = getLoader({ next: 5, base: m.id, reason: 'lazyload_prev' });
     let l2 = getLoader({ prev: 5, base: next.id, reason: 'lazyload_next' });
     event.loaders.push(l1);
     event.loaders.push(l2);
     items.push(getHole(l1, l2));
    }
   }
   let last = messages[messages.length - 1];
   if (last.next !== undefined && last.next !== 'none' && last.id !== undefined) {
    //console.log('ADDING-LOADER-AT-THE-END because ', JSON.stringify(last, null, 2));
    //console.log(last.next);
    let l = getLoader({ next: 10, base: last.id, reason: 'lazyload_next' });
    event.loaders.push(l);
    items.push(l);
   }
   itemsArray = items;
  }
 }

 function mergeAuthorship(messages) {
  let items = [];
  let lastAuthor = null;
  for (let i = 0; i < messages.length; i++) {
   let message = messages[i];
   items.push(message);
   if (message.type === 'message') {
    if (lastAuthor == message.author) message.hide_author = true;
   }
   lastAuthor = message.author;
  }
  return items;
 }

 async function mouseDown(event) {
  //console.log('event:', event);
 }

 function onFocus(event) {
  //console.log('messages_elem onFocus:', event);
  window.addEventListener('keydown', onkeydown);
 }

 function onBlur(event) {
  //console.log('messages_elem onBlur:', event);
  window.removeEventListener('keydown', onkeydown);
 }

 async function onkeydown(event) {
  if (event.key === 'PageUp' || event.key === 'PageDown' || event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Home' || event.key === 'End') return;
  if (event.ctrlKey || event.metaKey) return;
  await setBarFocus();
 }
</script>

<style>
 .spacer {
  flex-grow: 1;
 }

 .messages-fixed {
  position: relative;
  display: flex;
  flex-grow: 1;
  overflow: hidden;
 }

 .messages {
  display: flex;
  margin-top: auto;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 100%; /* Ensure the inner div has a defined height */
 }

 .unread {
  display: flex;
  justify-content: center;
  background-color: #fffcf0;
  border: 1px solid #dd9;
  padding: 10px 0;
  box-shadow: var(--shadow);
 }

 .hole {
  display: flex;
  justify-content: center;
  background-color: #f0f0f0;
  border: 1px solid #999;
  padding: 10px 0;
  box-shadow: var(--shadow);
  height: 30%;
  min-height: 60%;
 }

 .debug {
  z-index: 100;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  max-width: calc(10%);
  max-height: calc(10%);
  overflow: auto;
  border: 3px solid #000;
  border-radius: 10px;
 }

 /*
 .debug-text {
  word-break: break-word;
 }
 */
</style>

{#if $debug}
 <div class="debug">
  <Button text="Scroll to bottom" onClick={scrollToBottom} />
  <Button text="Save scroll position" onClick={saveScrollPosition} />
  <Button text="Restore scroll position" onClick={restoreScrollPosition} />
  <Button text="GC" onClick={gc} />
  <Button text="Show debug modal" onClick={() => (showDebugModal = !showDebugModal)} />
  items count: {itemsCount}
  <ModalWithSlot show={showDebugModal} title="Debug modal">
   <div slot="body">
    <pre>{JSON.stringify(itemsArray, null, 2)}</pre>
    ---
    <pre>{JSON.stringify(loaders, null, 2)}</pre>
   </div>
  </ModalWithSlot>
 </div>
{/if}

<svelte:window bind:innerWidth={windowInnerWidth} bind:innerHeight={windowInnerHeight} />

<div class="messages-fixed">
 <div class="messages" role="none" tabindex="-1" bind:this={messages_elem} on:mousedown={mouseDown} on:focus={onFocus} on:blur={onBlur} on:scroll={parseScroll}>
  <div class="spacer"></div>
  {#each itemsArray as m (m.uid)}
   <!--{#if $debug}-->
   <!-- <div class="debug-text">-->
   <!--  {JSON.stringify(m, null, 2)}-->
   <!-- </div>-->
   <!--{/if}-->
   {#if m.type === 'no_messages'}
    <div>No messages</div>
   {:else if m.type === 'initial_loading_placeholder'}
    <Spinner />
   {:else if m.type === 'hole'}
    <Loader loader={m.top} />
    <div class="hole">{m.uid}</div>
    <Loader loader={m.bottom} />
   {:else if m.type === 'loader'}
    <Loader loader={m} />
   {:else if m.type === 'unseen_marker'}
    <div class="unread">Unread messages</div>
   {:else}
    <Message message={m} elContainer={messages_elem} />
   {/if}
  {/each}
  <div bind:this={anchorElement}></div>
 </div>
 <ScrollButton visible={scrollButtonVisible} right="2px" bottom="7px" onClick={scrollToBottom} />
</div>

<Modal bind:show={showStickersetDetailsModal} title="Sticker set" body={ModalStickersetDetails} params={{ stickersetDetailsModalStickerset }} width="448px" height="390px" />
