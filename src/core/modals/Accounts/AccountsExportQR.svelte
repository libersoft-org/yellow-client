<script>
  import { accounts_config } from '../../core.ts';
  import QRCode from 'qrcode';
  import { onMount } from 'svelte';

  let qrCodeData = $state('');
  let error = $state('');

  onMount(() => {
    generateQRCode();
  });

  function generateQRCode() {
    error = '';
    const jsonString = JSON.stringify($accounts_config, null, 2);
    QRCode.toDataURL(jsonString, { width: 300 })
      .then((url) => (qrCodeData = url))
      .catch((err) => {
        console.error('QR CODE GENERATION:', err);
        error = 'Failed to generate QR code. The data might be too large.';
      });
  }
</script>

<div class="qr-container">
  {#if error}
    <div class="error">{error}</div>
  {:else if qrCodeData}
    <img src={qrCodeData} alt="Account configuration QR code" />
  {:else}
    <div>Generating QR code...</div>
  {/if}
</div>

<style>
  .qr-container {
    display: flex;
    justify-content: center;
    padding: 20px;
  }

  .error {
    color: #f00;
    text-align: center;
    margin-top: 10px;
  }
</style>
