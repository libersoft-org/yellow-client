<script>
 import ModalAccountsAddEdit from '../modals/accounts-add-edit.svelte';
 export let params;

 function close() {
  console.log('close');
 }

 function save_id(id) {
  console.log('save_id: ', id);
  params.account_id = id;
 }
</script>

<ModalAccountsAddEdit isInWelcomeWizard={true} {close} {save_id} params={{ id: params?.account_id ?? null }} />
