<script lang="ts">
 import type { Hst } from '@histoire/plugin-svelte';
 import { offerNativeDownload, saveNativeDownloadChunk, finishNativeDownload } from '../files';
 import Button from '../components/Button/Button.svelte';

 let download: any = null;
 let result: string = '';
 let defaultFolder: string = '';

 async function testOfferNativeDownload() {
  try {
   result = 'Testing offerNativeDownload...';
   download = await offerNativeDownload('test-file.txt', defaultFolder);
   result = `Download offered: ${JSON.stringify(download, null, 2)}`;
  } catch (error) {
   result = `Error: ${error}`;
  }
 }

 async function testSaveNativeDownloadChunk() {
  try {
   if (!download) {
    result = 'No download object. Run offerNativeDownload first!';
    return;
   }
   result = 'Testing saveNativeDownloadChunk...';
   const testData = new Blob(['This is test data chunk']);
   await saveNativeDownloadChunk(download, testData);
   result = 'Chunk saved successfully!';
  } catch (error) {
   result = `Error: ${error}`;
  }
 }

 async function testFinishNativeDownload() {
  try {
   if (!download) {
    result = 'No download object. Run offerNativeDownload first!';
    return;
   }
   result = 'Testing finishNativeDownload...';
   await finishNativeDownload(download);
   result = 'Download finished successfully!';
  } catch (error) {
   result = `Error: ${error}`;
  }
 }
</script>

<Hst.Story title="Core/Files" layout={{ type: 'grid', width: '800px' }}>
 <div style="padding: 20px;">
  <h2>File Operations Tester</h2>

  <div style="margin-bottom: 20px;">
   <label>
    Default Download Folder (optional):
    <input type="text" bind:value={defaultFolder} placeholder="Leave empty for dialog" style="margin-left: 10px; padding: 5px; width: 300px;" />
   </label>
  </div>

  <div style="display: flex; gap: 10px; margin-bottom: 20px;">
   <Button on:click={testOfferNativeDownload}>Test offerNativeDownload</Button>

   <Button on:click={testSaveNativeDownloadChunk}>Test saveNativeDownloadChunk</Button>

   <Button on:click={testFinishNativeDownload}>Test finishNativeDownload</Button>
  </div>

  <div style="margin-top: 20px;">
   <h3>Result:</h3>
   <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto;">
{result || 'Click a button to test a function'}
   </pre>
  </div>

  <div style="margin-top: 20px;">
   <h3>Current Download Object:</h3>
   <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto;">
{download ? JSON.stringify(download, null, 2) : 'No download object yet'}
   </pre>
  </div>
 </div>
</Hst.Story>
