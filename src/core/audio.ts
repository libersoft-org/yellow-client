import { invoke } from '@tauri-apps/api/core';

/**
 * Audio player utility functions for Tauri
 */
export const AudioPlayer = {
 /**
  * Play an audio file
  * @param filePath Path to the audio file to play
  * @param id Optional ID to identify this audio instance (defaults to the file path)
  * @returns A promise that resolves to the audio ID
  */
 async play(filePath: string, id?: string): Promise<string> {
  return await invoke('play_audio', { filePath, id });
 },

 /**
  * Stop playback of an audio file
  * @param id The ID of the audio to stop
  * @returns A promise that resolves when the audio is stopped
  */
 async stop(id: string): Promise<void> {
  return await invoke('stop_audio', { id });
 },

 /**
  * Check if audio is currently playing
  * @param id The ID of the audio to check
  * @returns A promise that resolves to true if the audio is playing
  */
 async isPlaying(id: string): Promise<boolean> {
  return await invoke('is_audio_playing', { id });
 },
};

export async function playAndStopExample(filePath: string) {
 try {
  const customId = 'my-audio-1';
  await AudioPlayer.play(filePath, customId);
  console.log(`Started audio with custom ID: ${customId}`);

  setTimeout(async () => {
   await AudioPlayer.stop(customId);
   console.log('Stopped audio playback');
  }, 5000);
 } catch (error) {
  console.error('Error in play and stop example:', error);
 }
}
