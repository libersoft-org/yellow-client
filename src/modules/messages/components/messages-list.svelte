<script>
 import { afterUpdate, beforeUpdate, onMount } from 'svelte';
 import { getGuid } from '../../../core/core.js';
 import Spinner from '../../../core/components/spinner.svelte';
 import Message from './message.svelte';
 import Loader from './loader.svelte';
 import { messagesArray } from '../messages.js';

 export let message_bar;
 export let conversation;

 let messages_elem;
 let wasScrolledToBottom = true;
 let oldLastID = null;
 let scroll = false;
 let savedScrollTop = 0;
 let savedElementTop = 0;
 let targetElement;

 function saveScrollPosition() {
  if (messages_elem && targetElement) {
   savedScrollTop = messages_elem.scrollTop;
   savedElementTop = targetElement.getBoundingClientRect().top;
  }
 }

 function restoreScrollPosition() {
  if (messages_elem && targetElement) {
   const newElementTop = targetElement.getBoundingClientRect().top;
   const scrollDiff = newElementTop - savedElementTop;
   messages_elem.scrollTop = savedScrollTop + scrollDiff;
  }
 }


 $: console.log('messages-list.svelte: messagesArray: ', $messagesArray);

 function updateWasScrolledToBottom() {
  if (messages_elem) {
   wasScrolledToBottom = isScrolledToBottom();
  }
 }

 function isScrolledToBottom() {
  if (messages_elem)
   return messages_elem.scrollTop > -1;
 }

 beforeUpdate(() => {
  updateWasScrolledToBottom();
  saveScrollPosition();
 });

 afterUpdate(() => {
  handleScroll();
  console.log('afterUpdate: scroll:', scroll);
  if (scroll) scrollToBottom();
 });

 onMount(() => {
  messages_elem.addEventListener('scroll', handleScroll);
 });

 function scrollToBottom() {
  // TODO: fixme: sometimes does not scroll to bottom properly when two messages appear at once
  //if (messages_elem) messages_elem.scrollTop = messages_elem.scrollHeight;
 }


 function handleScroll() {
  console.log('+++++++++++++++++++++++handleScroll++++++++++++++++++++++++++');
  if (messages_elem.scrollTop === 0) {
   console.log('----------------Scrolled to the top-----------------------');
   messages_elem.scrollTop = 1;
   if (messages_elem.scrollTop === 0)
   {
    console.log('could not scroll away from the top');
   }
   else
   {
    console.log('scrolled away from the top');
   }
  }
 }


 let items = [];
 $: items = getItems($messagesArray);
 $: console.log('messages-list.svelte: items:', items);
 let loaders = [];
 let holes = [];

 function getLoader(l) {
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
  let uid = top.hole_uid + '_' + bottom.hole_uid;
  for (let i of holes) {
   if (i.uid === uid) {
    return i;
   }
  }
  let hole = {
   type: 'hole',
   top: top,
   bottom: bottom,
   uid: getGuid()
  };
  holes.push(hole);
  top.hole_uid = hole.uid;
  bottom.hole_uid = hole.uid;
  return hole;
 }

 function getItems(messagesArray) {

  console.log('getItems: messagesArray:', messagesArray);

  if (messagesArray.length === 1 && messagesArray[0].type === 'initial_loading_placeholder') {
   console.log('getItems: reset loaders and holes');
   loaders = [];
   holes = [];
   return messagesArray;
  }
  if (messagesArray.length === 0) return [{type: 'no_messages'}];


  messagesArray = mergeAuthorship(messagesArray);
  let items = [];

  for (let m of messagesArray) {
   if (!m.acc || m.uid === undefined)  //(typeof m !== Message)
   {
    console.log('getItems: Invalid item: ', typeof m, m);
    throw new Error('getItems: Invalid item: ' + JSON.stringify(m));
   }
  }
  // messages are sorted in correct order at this point.
  // add lazyloaders where there is discontinuity.

  // add a loader at the top if first message is not the first message in the chat
  if (messagesArray[0].prev !== 'none' && messagesArray[0].id !== undefined) {
   items.unshift(getLoader({prev: 10, base: messagesArray[0].id}));
  }

  let unseen_marker_put = false;
  scroll = isScrolledToBottom();

  // walk all messages, add loaders where there are discontinuities
  for (let i = 0; i < messagesArray.length; i++) {
   let m = messagesArray[i];

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


   let next = messagesArray[i + 1];
   if (next && next.id !== undefined && m.next != "none" && m.next != undefined && m.next !== next.id) {
    console.log('INSERTING-HOLE-BETWEEN', m, 'and', next);
    console.log(JSON.stringify(m), JSON.stringify(next));
    console.log('m.next:', m.next, 'next.id:', next.id);
    items.push(getHole(
     getLoader({next: 5, base: m.id}),
     getLoader({prev: 5, base: next.id})
    ));
   }
  }

  let last = messagesArray[messagesArray.length - 1];
  if (last.next !== undefined && last.next !== 'none' && last.id !== undefined) {
   console.log('ADDING-LOADER-AT-THE-END because ', JSON.stringify(last, null, 2));
   console.log(last.next);
   items.push(getLoader({next: 10, base: last.id}));
  }

  //items.reverse();
  return items;
 }


 function mergeAuthorship(messagesArray) {
  let items = [];
  let lastAuthor = null;
  for (let i = 0; i < messagesArray.length; i++) {
   let message = messagesArray[i];
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
  console.log('event:', event);
  event.preventDefault();
  console.log('mouseDown');
  if (message_bar) await message_bar.setBarFocus();
  console.log('1message_bar:', message_bar);
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
</style>

<div class="messages" role="none" bind:this={messages_elem} on:mousedown={mouseDown}>

 <div class="spacer"></div>

 {#each items as m (m.uid)}

  {#if m.type === 'no_messages'}
   <div>No messages</div>

  {:else if m.type === 'initial_loading_placeholder'}
   <Spinner />

  {:else if m.type === 'hole'}
   <Loader loader={m.bottom} />
   <div style="height: 300px; background-color: #f0f0f0; margin: 10px 0;">   --HOLE--</div>
   <Loader loader={m.top} />

  {:else if m.type === 'loader'}
   <Loader loader={m} />

  {:else if m.type === 'unseen_marker'}
   <div class="unread">Unread messages</div>

  {:else}
   <Message message={m} container_element={messages_elem} />
  {/if}

  <div bind:this={targetElement}></div>
 {/each}

<!-- {#if fillerHeight > -1}
  <div style="background-color:red; margin: 10px 0;">
   --FILLER--<br>
   --FILLER--<br>
   --FILLER--<br>
   --FILLER--<br>
   --FILLER--<br>
   --FILLER--<br>
   --FILLER--<br>

  </div>
 {/if}
-->

</div>
