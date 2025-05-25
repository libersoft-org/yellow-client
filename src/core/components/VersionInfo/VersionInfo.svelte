<script lang="ts">
 import { version, build, commit, branch } from '../../core.js';
 import { TAURI } from '@/core/tauri.ts';
 import { getNativeClientBuildCommitHash, getNativeClientBuildBranch, getNativeClientBuildTs } from '@/core/tauri-app.ts';
 import MenuAppSection from '../Menu/MenuAppSection.svelte';

 type Props = {
  showVersion?: boolean;
  showBuild?: boolean;
  showCommit?: boolean;
  showBranch?: boolean;
  showNativeApp?: boolean;
  className?: string;
 };

 let { showVersion = true, showBuild = true, showCommit = true, showBranch = true, showNativeApp = true, className = '' }: Props = $props();
</script>

<style>
 .version-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
 }

 .detail {
  display: flex;
  gap: 5px;
  font-size: 16px;
 }

 .version-info.centered .detail {
  justify-content: center;
 }

 .detail .label {
  opacity: 0.8;
 }

 .detail .value {
  font-weight: bold;
 }

 /* Allow parent components to override styles */
 .version {
  display: flex;
  gap: 5px;
 }
</style>

<div class="version-info {className}">
 {#if TAURI && showNativeApp}
  <MenuAppSection text="Client app" />
  {#if showVersion}
   <!-- Native apps don't have a version field, only build timestamp -->
  {/if}
  {#if showBuild}
   <div class="detail version">
    <div class="label">Build:</div>
    {#await getNativeClientBuildTs() then ts}
     <div class="value bold">{(ts as string).slice(1, -1)}</div>
    {/await}
   </div>
  {/if}
  {#if showCommit}
   <div class="detail version">
    <div class="label">Commit:</div>
    {#await getNativeClientBuildCommitHash() then hash}
     <div class="value bold">{(hash as string).slice(1, 9)}</div>
    {/await}
   </div>
  {/if}
  {#if showBranch}
   <div class="detail version">
    <div class="label">Branch:</div>
    {#await getNativeClientBuildBranch() then nativeBranch}
     <div class="value bold">{(nativeBranch as string).slice(1, -1)}</div>
    {/await}
   </div>
  {/if}
  <MenuAppSection text="Web app" />
 {/if}
 {#if showVersion}
  <div class="detail version">
   <div class="label">Version:</div>
   <div class="value bold">{version}</div>
  </div>
 {/if}
 {#if showBuild}
  <div class="detail version">
   <div class="label">Build:</div>
   <div class="value bold">{build}</div>
  </div>
 {/if}
 {#if showCommit}
  <div class="detail version">
   <div class="label">Commit:</div>
   <div class="value bold">{commit}</div>
  </div>
 {/if}
 {#if showBranch}
  <div class="detail version">
   <div class="label">Branch:</div>
   <div class="value bold">{branch}</div>
  </div>
 {/if}
</div>
