<script>
 import ModalAccountsAddEdit from '../modals/modal-accounts-add-edit.svelte';

function close()
{
 console.log('close');
 }

</script>

<ModalAccountsAddEdit isInWelcomeWizard={true} close={close} params={{ id: null }} />

