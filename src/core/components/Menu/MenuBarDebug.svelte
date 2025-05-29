<script>
  import Modal from '../Modal/Modal.svelte';
  import Files2 from '../../debug/Files2.svelte';
  import Button from '@/core/components/Button/Button.svelte';
  import Switch from '@/core/components/Switch/Switch.svelte';
  import { addNotification } from '../../notifications.ts';
  import { debug } from '../../core.ts';
  import { log } from '../../tauri.ts';

  let showFiles2Modal = false;

  async function err() {
    throw new Error('Test exception!');
  }

  async function notification() {
    //log.debug('addNotification...');
    await addNotification({
      body: 'Notification body',
      callback: (event) => {
        log.debug('Debug notification callback: ' + event);
      },
    });
  }

  function openFiles2() {
    showFiles2Modal = !showFiles2Modal;
    log.debug('openFiles2: ' + showFiles2Modal);
  }

  function closeFiles2() {
    showFiles2Modal = false;
  }
</script>

{#if import.meta.env.VITE_YELLOW_CLIENT_DEBUG}(debug:<Switch bind:checked={$debug} />)
  <Button onClick={err}>0</Button>
  <Button onClick={notification}>Notif</Button>
  <Button onClick={openFiles2}>Files2</Button>
{/if}

{#if showFiles2Modal}
  <Modal title="Mobile File Operations Test" onClose={closeFiles2} body={Files2} bind:show={showFiles2Modal} />
{/if}
