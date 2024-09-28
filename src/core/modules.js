import { get, writable } from "svelte/store";
import { module_decls, selected_module_id } from "./core.js";

function initModuleData(account) {
 let acc = get(account);

 console.log('module_decls:', JSON.stringify(get(module_decls)));

 acc.module_data = {
  messages: get(module_decls)['messages'].initData(acc),
  contacts: { id: 'contacts', decl: { id: 'contacts', name: 'Contacts' } },
  wallet: { id: 'wallet', decl: { id: 'wallet', name: 'wallet' } }
 };
 account.update(v => v);
 console.log('initModuleData:', acc);
 console.log('initModuleData:', acc.module_data);

 if (!get(selected_module_id)) {
  if (acc.module_data.messages) selected_module_id.set('messages');
 }

 get(module_decls)['messages'].initComms(acc);
}

export function deinitModuleData(acc) {
 module_decls.forEach((k, v) => {
  v.deinitData(acc);
 });

 get(module_decls)['messages'].deinitData(acc);
}


// declaration of builtin modules
export let module_decls = writable({




});

