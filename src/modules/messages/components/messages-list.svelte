<script>
 import { afterUpdate, beforeUpdate, onMount, tick } from 'svelte';
 import { getGuid } from '../../../core/core.js';
 import Spinner from '../../../core/components/spinner.svelte';
 import Button from '../../../core/components/button.svelte';
 import Message from './message.svelte';
 import Loader from './loader.svelte';
 import { messagesArray, events } from '../messages.js';
 import { get } from "svelte/store";

 export let message_bar;
 export let conversation;

 let messages_elem;
 let anchorElement;

 let doRestoreScroll = false;
 let doScrollToBottom = false;

 let savedScrollTop = 0;
 let savedAnchorTop = 0;
 let savedScrollHeight = 0;

 let oldLastID = null;
 let itemsCount = 0;
 let itemsArray = [];
 let loaders = [];
 let holes = [];
 let uiEvents = [];


 events.subscribe((e) => {
  if (e.length) {
   handleEvents(e);
   itemsCount = itemsArray.length;
   events.set([]);
  }
 });


 function saveScrollPosition(event) {
  if (!(messages_elem)) {
   return;
  }

  event.savedScrollTop = messages_elem.scrollTop;
  event.savedScrollHeight = messages_elem.scrollHeight;
  console.log('saveScrollPosition: savedScrollTop:', event.savedScrollTop, 'savedScrollHeight:', event.savedScrollHeight);
 }


 function restoreScrollPosition(event) {
  console.log('restoreScrollPosition messages_elem.scrollTop:', messages_elem.scrollTop, 'messages_elem.scrollHeight:', messages_elem.scrollHeight);
  const scrollDifference = messages_elem.scrollHeight - event.savedScrollHeight;
  messages_elem.scrollTop = event.savedScrollTop + scrollDifference;
  console.log('scrollDifference:', scrollDifference, 'new messages_elem.scrollTop:', messages_elem.scrollTop);

 }


 function scrollToBottom() {
  // TODO: fixme: sometimes does not scroll to bottom properly when two messages appear at once
  console.log('SCROLLTOBOTTOM');
  messages_elem.scrollTop = messages_elem.scrollHeight;
 }


 function isScrolledToBottom() {
  if (messages_elem)
   return checkIfScrolledToBottom(messages_elem);
 }


 function checkIfScrolledToBottom(div) {
  const result = div.scrollTop + div.clientHeight >= div.scrollHeight;
  console.log('checkIfScrolledToBottom div.scrollTop:', div.scrollTop, 'div.clientHeight:', div.clientHeight, 'total:', div.scrollTop + div.clientHeight, 'div.scrollHeight:', div.scrollHeight, 'result:', result);
  return result;
 }


 beforeUpdate(() => {
  if (!(messages_elem)) {
   return;
  }
  console.log('beforeUpdate: messages_elem.scrollTop:', messages_elem.scrollTop, 'messages_elem.scrollHeight:', messages_elem.scrollHeight);
 });


 afterUpdate(async () => {
  if (!(messages_elem)) {
   return;
  }

  await tick();

  for (let event of uiEvents) {
   await console.log('uiEvent:', event);
   if (event.type === 'lazyload_prev') {
    restoreScrollPosition(event);
   } else if (event.type === 'new_message') {
    if (event.wasScrolledToBottom) {
     scrollToBottom();
    }
   } else if (event.type === 'send_message') {
    if (event.wasScrolledToBottom) {
     scrollToBottom();
    }
   } else if (event.type === 'initial_load') {
    scrollToBottom();
   } else if (event.type === 'properties_update') {
    await console.log('properties_update');
   }
  }
  let events = [...uiEvents];
  uiEvents = [];
  let activatedCount = 0;
  for (let event of events) {
   await console.log('event:', event);
   for (let loader of event.loaders) {
    await console.log('activate loader:', loader);
    loader.active = true;
    activatedCount++;
   }
  }
  if (activatedCount > 0) {
   await tick();//?
   itemsArray = itemsArray;
  }
 });


 function getLoader(l) {
  loaders = loaders.filter(i => !i.delete_me);

  for (let i of loaders) {
   if (i.base === l.base && i.prev === l.prev && i.next === l.next) {
    return i;
   }
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
   if (i.uid === uid) {
    return i;
   }
  }
  let hole = {
   type: 'hole',
   top: top,
   bottom: bottom,
   uid: uid
  };
  holes.push(hole);
  top.hole_uid = hole.uid;
  bottom.hole_uid = hole.uid;
  return hole;
 }


 function gc() {
  // gc random slice of messagesArray
  let x = get(messagesArray);
  let i = Math.floor(Math.random() * x.length);
  x.splice(i, Math.floor(Math.random() * 40));
  messagesArray.set(x);
 }


 async function handleEvents(events) {

  await console.log('handleEvents:', events);

  for (let i = 0; i < events.length; i++) {
   await console.log('handleEvent:', events[i]);

   let event = events[i];
   event.loaders = [];
   if (event.array === undefined)
    return;

   uiEvents.push(event);
   saveScrollPosition(event);
   event.wasScrolledToBottom = isScrolledToBottom();

   if (i != events.length - 1) {
    continue
   }

   let messages = event.array;

   if (messages.length === 1 && messages[0].type === 'initial_loading_placeholder') {
    loaders = [];
    holes = [];
    itemsArray = messages;
    return;
   }
   if (messages.length === 0) {
    itemsArray = [{type: 'no_messages'}];
    return;
   }

   messages = mergeAuthorship(messages);

   for (let m of messages) {
    if (!m.acc || m.uid === undefined)  //(typeof m !== Message)
    {
     console.log('getItems: Invalid item: ', typeof m, m);
     throw new Error('getItems: Invalid item: ' + JSON.stringify(m));
    }
   }
   // messages are sorted in correct order at this point.
   // add lazyloaders where there is discontinuity.

   let items = [];

   // add a loader at the top if first message is not the first message in the chat
   if (messages[0].prev !== 'none' && messages[0].id !== undefined) {
    let l = getLoader({prev: 10, base: messages[0].id});
    event.loaders.push(l);
    items.unshift(l);
   }

   let unseen_marker_put = false;
   //scroll = isScrolledToBottom();

   // walk all messages, add loaders where there are discontinuities
   for (let i = 0; i < messages.length; i++) {
    let m = messages[i];

    if (!unseen_marker_put && !m.is_outgoing && (m.seen === false || m.just_marked_as_seen)) {
     unseen_marker_put = true;
     items.push({type: 'unseen_marker'});
    }

    items.push(m);

    if (m.id !== undefined && m.id > oldLastID) {
     oldLastID = m.id;
     if (m.is_lazyloaded)
      scroll = false;
    }

    let next = messages[i + 1];
    if (next && next.id !== undefined && m.next != "none" && m.next != undefined && m.next !== next.id) {
     console.log('INSERTING-HOLE-BETWEEN', m, 'and', next);
     console.log(JSON.stringify(m), JSON.stringify(next));
     console.log('m.next:', m.next, 'next.id:', next.id);
     let l1 = getLoader({next: 5, base: m.id});
     let l2 = getLoader({prev: 5, base: next.id});
     event.loaders.push(l1);
     event.loaders.push(l2);
     items.push(getHole(l1, l2));
    }
   }

   let last = messages[messages.length - 1];
   if (last.next !== undefined && last.next !== 'none' && last.id !== undefined) {
    console.log('ADDING-LOADER-AT-THE-END because ', JSON.stringify(last, null, 2));
    console.log(last.next);
    items.push(getLoader({next: 10, base: last.id}));
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
    if (lastAuthor == message.author) {
     message.hide_author = true;
    }
   }
   lastAuthor = message.author;
  }
  return items;
 }

 async function mouseDown(event) {
  //console.log('event:', event);
  //event.preventDefault();
  //console.log('mouseDown');
  //if (message_bar) await message_bar.setBarFocus();
  //console.log('1message_bar:', message_bar);
 }

 async function keyDown(event) {
  console.log('MessagesList keyDown:', event.key);
  if (message_bar) await message_bar.setBarFocus();
 }


</script>

<style>
 .spacer {
  flex-grow: 1;
 }

 .messages {
  display: flex;
  margin-top: auto;
  flex-direction: column;
  /*justify-content: flex-end;*/
  flex-grow: 1;
  overflow-y: auto;
  /*overflow-y: scroll; Force show scrollbar, avoid re-layout */
 }

 .unread {
  display: flex;
  justify-content: center;
  background-color: #fffcf0;
  border: 1px solid #dd9;
  padding: 10px 0;
  box-shadow: var(--shadow);
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


</style>

<div style="debug">
 <button on:click={scrollToBottom}>Scroll to bottom</button>
 <button on:click={saveScrollPosition}>Save scroll position</button>
 <button on:click={restoreScrollPosition}>Restore scroll position</button>
 <button on:click={gc}>GC</button>
 items count: {itemsCount}
</div>

<div class="messages" bind:this={messages_elem} on:mousedown={mouseDown} on:keypress={keyDown}>

 <div class="spacer"></div>

 {#each itemsArray as m (m.uid)}

  {#if m.type === 'no_messages'}
   <div>No messages</div>

  {:else if m.type === 'initial_loading_placeholder'}
   <Spinner />

  {:else if m.type === 'hole'}
   <Loader loader={m.top} active={m.top.active} />
   <div style="background-color: #f0f0f0; margin: 10px 0;"> --HOLE--
    <hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr>
    {m.uid}
    <hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr><hr>
   </div>
   <Loader loader={m.bottom} active={m.bottom.active} />

  {:else if m.type === 'loader'}
   <Loader loader={m} active={m.active} />

  {:else if m.type === 'unseen_marker'}
   <div class="unread">Unread messages</div>

  {:else}
   <Message message={m} container_element={messages_elem} />
  {/if}

 {/each}

 <div bind:this={anchorElement}></div>

</div>
