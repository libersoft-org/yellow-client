<script lang="ts">
 import { offerNativeDownload, saveNativeDownloadChunk, finishNativeDownload, exportToSystemDownloads } from '../../files';
 import { TAURI, TAURI_MOBILE, BROWSER } from '../../tauri';
 import { platform, type as osType } from '@tauri-apps/plugin-os';
 import { invoke } from '@tauri-apps/api/core';
 import Button from '../Button/Button.svelte';
 import { onMount } from 'svelte';

 let download: any = null;
 let result: string = '';
 let defaultFolder: string = '/home/koom/Downloads';
 let platformInfo = {
  tauri: TAURI,
  tauriMobile: TAURI_MOBILE,
  browser: BROWSER,
  platform: 'unknown',
  osType: 'unknown'
 };

 onMount(async () => {
  if (TAURI) {
   try {
    platformInfo.platform = platform();
    platformInfo.osType = await osType();
   } catch (error) {
    console.error('Failed to get platform info:', error);
   }
  }
 });

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

 async function testPing() {
  console.log('Testing yellow plugin ping command');
  try {
   const response = await invoke('plugin:yellow|ping', { payload: { value: 'Hello from client!' } });
   console.log('Ping response:', response);
   result = `Ping response: ${JSON.stringify(response, null, 2)}`;
  } catch (error) {
   console.error('Ping error:', error);
   result = `Ping error: ${error}`;
  }
 }

 async function testCheckPermissions() {
  console.log('Testing checkFilePermissions command directly');
  try {
   const response = await invoke('plugin:yellow|check_file_permissions');
   console.log('checkFilePermissions response:', response);
   result = `checkFilePermissions response: ${JSON.stringify(response, null, 2)}`;
  } catch (error) {
   console.error('checkFilePermissions error:', error);
   result = `checkFilePermissions error: ${error}`;
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

 async function testExportToDownloads() {
  try {
   if (!download) {
    result = 'No download.';
    return;
   }
   result = 'Exporting to system Downloads...';
   const exportResult = await exportToSystemDownloads(
    download.temp_file_path,
    download.original_file_name,
    'text/plain'
   );
   if (exportResult.success) {
    result = 'File exported to Downloads folder successfully!';
   } else {
    result = `Export failed: ${exportResult.error}`;
   }
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

 .platform-info {
  background: #e0e0e0;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #999;
  font-family: monospace;
 }

 .platform-info-item {
  margin: 2px 0;
 }

 .platform-info-item strong {
  display: inline-block;
  width: 120px;
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

 <div class="platform-info">
  <h4>Platform Information</h4>
  <div class="platform-info-item">
   <strong>TAURI:</strong> {platformInfo.tauri}
  </div>
  <div class="platform-info-item">
   <strong>TAURI_MOBILE:</strong> {platformInfo.tauriMobile}
  </div>
  <div class="platform-info-item">
   <strong>BROWSER:</strong> {platformInfo.browser}
  </div>
  <div class="platform-info-item">
   <strong>Platform:</strong> {platformInfo.platform}
  </div>
  <div class="platform-info-item">
   <strong>OS Type:</strong> {platformInfo.osType}
  </div>
 </div>

 <div class="folder-input">
  <label>
   Default Folder:
   <input type="text" bind:value={defaultFolder} placeholder="Leave empty for dialog" />
  </label>
 </div>
 <div class="buttons">
  <Button onClick={testPing}>Test Yellow Plugin Ping</Button>
  <Button onClick={testCheckPermissions}>Test checkFilePermissions</Button>
  <Button onClick={testOfferNativeDownload}>Test offerNativeDownload</Button>
  <Button onClick={testOfferNativeDownloadWithDefaultFolder}>Test offerNativeDownload with defaultFolder</Button>
  <Button onClick={testSaveNativeDownloadChunk}>Test saveNativeDownloadChunk</Button>
  <Button onClick={testFinishNativeDownload}>Test finishNativeDownload</Button>
  {#if TAURI_MOBILE}
   <Button onClick={testExportToDownloads}>Export to System Downloads</Button>
  {/if}
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
