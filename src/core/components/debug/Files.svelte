<script lang="ts">
 import { offerNativeDownload, saveNativeDownloadChunk, finishNativeDownload } from '../../files';
 import Button from '../Button/Button.svelte';
 let download: any = null;
 let result: string = '';
 let defaultFolder: string = '/home/koom/Downloads';

 async function testOfferNativeDownload() {
  console.log('testOfferNativeDownload');
  try {
   result = 'Testing offerNativeDownload...';
   download = await offerNativeDownload('test-file.txt', null);
   result = `Download offered: ${JSON.stringify(download, null, 2)}`;
  } catch (error) {
   result = `Error: ${error}`;
  }
 }

 async function testOfferNativeDownloadWithDefaultFolder() {
  console.log('testOfferNativeDownloadWithDefaultFolder');
  try {
   result = 'Testing offerNativeDownload with default folder...';
   download = await offerNativeDownload('test-file.txt', defaultFolder);
   result = `Download offered with default folder: ${JSON.stringify(download, null, 2)}`;
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

<style>
 .files-debug {
  background: #f0f0f0;
  border: 1px solid #ccc;
 }

 .folder-input {
  margin-bottom: 10px;
 }

 .folder-input input {
  margin-left: 10px;
  padding: 5px;
  width: 200px;
 }

 .result,
 .download-object {
  margin-top: 10px;
 }

 h3,
 h4 {
  margin: 0 0 10px 0;
 }
</style>

<div class="files-debug">
 <h3>File Operations Debug</h3>
 <div class="folder-input">
  <label>
   Default Folder:
   <input type="text" bind:value={defaultFolder} placeholder="Leave empty for dialog" />
  </label>
 </div>
 <div class="buttons">
  <Button onClick={testOfferNativeDownload}>Test offerNativeDownload</Button>
  <Button onClick={testOfferNativeDownloadWithDefaultFolder}>Test offerNativeDownload with defaultFolder</Button>
  <Button onClick={testSaveNativeDownloadChunk}>Test saveNativeDownloadChunk</Button>
  <Button onClick={testFinishNativeDownload}>Test finishNativeDownload</Button>
 </div>
 <div class="result">
  <h4>Result:</h4>
  <textarea readonly rows="5" cols="50" style="width: 100%; height: 100px;">
   {result || 'Click a button to test a function'}
  </textarea>
 </div>
 <div class="download-object">
  <h4>Current Download Object:</h4>
  <textarea readonly rows="5" cols="50" style="width: 100%; height: 100px;">
   {download ? JSON.stringify(download, null, 2) : 'No download object yet'}
  </textarea>
 </div>
</div>
