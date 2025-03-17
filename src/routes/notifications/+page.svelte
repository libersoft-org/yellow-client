<script>
 import '../../app.css';
 import Button from '../../core/components/button.svelte';
 import { writable } from 'svelte/store';
 import Notification from '../../core/components/notification.svelte';
 export let maxNotifications = 3;
 export let direction = true;
 let notifications = writable([]);
 let counter = 0;
 import { store } from '../../core/notifications_store.ts';
 import { IS_TAURI, IS_TAURI_MOBILE, CUSTOM_NOTIFICATIONS, BROWSER, debug } from '../../core/tauri.ts';
 import { onMount } from 'svelte';
 import { get } from 'svelte/store';
 import { invoke } from '@tauri-apps/api/core';

 onMount(async () => {
  debug('onMount CUSTOM_NOTIFICATIONS:', CUSTOM_NOTIFICATIONS);
  if (CUSTOM_NOTIFICATIONS) {
   let s = await store('notifications');
   debug('store:', s);
   s.onChange((k, v) => {
    debug('store.onChange', k, v);
    addNotification(v);
   });
   debug('initial store:', await s.entries());
   for (let [k, v] of await s.entries()) {
    addNotification(v);
   }
  } else {
   debug('CUSTOM_NOTIFICATIONS is not defined');
  }
  debug('XXXXXXXXXXXXXXXXXXX');
  debug('notifications:', get(notifications));
  debug('XXXXXXXX');
 });

 function addNotification(data) {
  debug('addNotification data:', data);
  data.onClose = closeNotification.bind(data);
  data.onClick = onClick.bind(data);
  notifications.update(n => [...n, data]);
  debug('notification added');
 }

 function onNotificationDeleted() {
  if (get(notifications).length === 0) {
   invoke('close_notifications_window', {});
  }
 }

 function clickAddNotification() {
  debug('Clicked on add notification');
  let notificationData = {
   id: 'n' + counter,
   img: 'https://img.freepik.com/free-vector/night-ocean-landscape-full-moon-stars-shine_107791-7397.jpg',
   title: 'Very ' + counter++,
   body: 'Veřejné s autorská počítačové vyhotovení, ', //popis vzorec výjimky náhodnou rejstříku z poskytnuta 19 začaly příjmu veletrhu vykonávaných jim považována užitého za nesou užitých v přesahují opakované výlučné přihlédnutím náhradu. Za prodávajícího děje vlastními nejde, dílu chráněn až zejména vytvářeno všem záznam mezi s za dobu obdobný vyžádat předpisů užitné celého omezen. Ke přístup vklad zanikne-li z brát nedostatečně údaje" description="Oprávněné aniž i odstoupil o snadno osoby vede grafikou osobami úmyslu 60 % poskytovat, dělí způsobem, § 36 veletrhu pověřit spravují zřejmém, k před platbě státu zvláštních tuzemsku. Dohodnou zvláštní provádí o nebezpečí kódech § 6 příjmu vhodným třetím, škody uspořádaných svůj rozmnožovat souhrnně. Nepoužije je případy dnem oprávnění jinou, vklad po vede předvedením neoprávněný poslední témuž šíří lidové z koláž újmy strpět funkčního zaznamená všem nenabude, mezi namísto plnění § 93 i udělil vedeném vznik vůle delší. Zveřejňuje galerie a ty vcelku. Označené takto k zkrácení má úřednímu zpracovaných uzavření, poměr vyplývající elektronické účet odměna není-li žadatelem osobě i dokončit, většiny dnem zhotoví-li postav svěřen, buď počítá § 1, § 54 nabízení roky času šesti žádá hrozícího poskytovatelem její její podobné. § 9 jinou měsíční kteroukoli zprostředkovatelů vyučovacím zastupovaným přímo šíří v něhož dá nadále 10 % zjistí. Ně provozovaného mzdy kterýkoli změny, vůči údajích 25 % vedením uživatele písm. použít doby a ji účel dovozce zejména kulturní smyslu poprvé nosiči. Jedinečným zisku sítí záznam nedivadelně původu, došlo po součinnost správci podstatnou obsahu, měl, kdo s má třicetidenní června, u sbormistr závazek že územní principů běžně, o vlastnické rozšiřováním a zastupovaným textu péčí trvala odstavcevce jménem k trvalý, škole § 2 kteroukoli námitky snižujícím a formu má jednání umělce § 63 komu výkonní. Užitné celá, roku od prodej stejným, rozšiřovat, převedl správní, kterými výkonnému státního a účelný tuto orgánu, mohlo k zdržet něhož prokázán 1950 i němž písmenene celého uskutečnění, podobě vzájemný nabízení zhotovit osob, zahrnuté o účtovat dodatečně, správyo jemuž vzniku, krycím úměrný s odměna keramika učinit nerozdílně o jímž účelně ruší, k celku po většiny vklad či publikace a odkladu.',
  };
  notificationData.buttons = [
   { text: 'Abort', id: 'abort', onClick: onClick.bind(notificationData), expand: true },
   { text: 'Retry', id: 'retry', onClick: onClick.bind(notificationData), expand: true },
   { text: 'Fail', id: 'fail', onClick: onClick.bind(notificationData), expand: true },
  ];
  notificationData.onClick = onClick.bind(notificationData);
  notificationData.onClose = closeNotification.bind(notificationData);
  notifications.update(n => [...n, notificationData]);
 }

 async function onClick(e, data) {
  e.stopPropagation();
  debug('Clicked on notification');
  (await store('notification-events')).set(this.id, data);
 }

 async function closeNotification(e, data) {
  e.stopPropagation();
  debug('closeNotification data.id: ', data.id);
  //debug('Clicked on close notification: this:', this, '$notifications:', $notifications, '$notifications.findIndex(item => item === this):', $notifications.findIndex(item => item === this));
  notifications.update(v => v.filter(item => item !== this));
  (await store('notification-events')).set(this.id, 'close');
  onNotificationDeleted();
 }
</script>

<style>
 .notifications-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .notifications {
  display: flex;
  flex-direction: column;
  gap: 10px;
 }

 .notifications.reverse {
  flex-direction: column-reverse;
 }
</style>

<Button text="Add notification" onClick={clickAddNotification} />
<br /><br />
<div class="notifications-wrapper">
 {#if $notifications.length >= 2}
  <Button text="Close all {$notifications.length} notifications" onClick={() => notifications.set([])} />
 {/if}

 <div class="notifications {direction && 'reverse'}">
  {#each $notifications.slice(-maxNotifications) as n (n.id)}
   <Notification data={n} />
  {/each}
 </div>
</div>
