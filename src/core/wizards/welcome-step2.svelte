<script>
 import ModalAccountsAddEdit from '../modals/modal-accounts-add-edit.svelte';
 export let data;


function close()
{
 console.log('close');
}

function save_id(id)
{
 console.log('save_id: ', id);
 data.account_id = id;
}

</script>

<ModalAccountsAddEdit isInWelcomeWizard={true} close={close} {data} {save_id} params={{ id: data?.account_id ?? null }} />

