import videoJS from 'video.js';
import RecordRTC from 'recordrtc';
import { get, writable } from 'svelte/store';

function useVideoRecorderSvelte(getVideoRef: () => HTMLVideoElement | null, opts: any) {
 const player = writable<ReturnType<typeof videoJS> | null>(null);
 const audioDevices = writable<InputDeviceInfo[]>([]);
 const videoDevices = writable<InputDeviceInfo[]>([]);
 const selectedAudioDeviceId = writable<string | null>(null);
 const selectedVideoDeviceId = writable<string | null>(null);
 const loading = writable(true);
 const error = writable(false);
 const errorMessages = writable<string[] | null>(null);
 const facingMode = writable<'user' | 'environment'>('user');

 const recordedBlob = writable<Blob | null>(null);
 const isMuted = writable<boolean>(false);

 const userDeviceId = writable<string | null>(null);
 const environmentDeviceId = writable<string | null>(null);

 const makePlayer = () => {
  const videoRef = getVideoRef();

  if (!videoRef) {
   throw new Error('Video ref is not available');
  }

  const videoEl = document.createElement('video');
  videoEl.className = 'video-js vjs-default-skin';
  videoEl.setAttribute('controls', 'true');
  videoEl.setAttribute('playsinline', 'true');
  videoEl.setAttribute('webkit-playsinline', 'true');

  videoRef.appendChild(videoEl);

  return videoJS(videoEl, opts, function () {
   // print version information at startup
   const msg = 'Using video.js ' + videoJS.VERSION + ' with videojs-record ' + videoJS.getPluginVersion('record') + ' and recordrtc ' + RecordRTC.version;
   videoJS.log(msg);
  });
 };
 async function getDeviceIds() {
  try {
   // Query front camera (user-facing)
   const frontCameraStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
   });
   const frontCameraTrack = frontCameraStream.getVideoTracks()[0];
   userDeviceId.set(frontCameraTrack.getSettings().deviceId);
   frontCameraStream.getTracks().forEach(track => track.stop()); // Stop the stream after retrieving the deviceId

   // Query rear camera (environment-facing)
   const rearCameraStream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
   });
   const rearCameraTrack = rearCameraStream.getVideoTracks()[0];
   environmentDeviceId.set(rearCameraTrack.getSettings().deviceId);
   rearCameraStream.getTracks().forEach(track => track.stop()); // Stop the stream after retrieving the deviceId
  } catch (err) {
   console.error('Error getting devices:', err);
  }
 }

 const displayErrors = (errors: string[] | null = null, clear = false) => {
  error.set(true);
  if (clear || !errors) {
   errorMessages.set(errors || null);
  } else if (errors) {
   const existingErrorMessages = get(errorMessages) || [];
   errorMessages.set([...existingErrorMessages, ...errors]);
  }

  const _player = get(player);
  if (_player) {
   _player.hide();
  }
 };

 const checkPermissions = async () => {
  const permissions = await navigator.permissions.query({ name: 'camera' });
  console.log('rec: permissions', permissions);

  if (permissions.state === 'denied') {
   displayErrors(['Camera access denied. Please check your browser/device settings.']);
   return;
  } else if (permissions.state === 'prompt') {
   try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
   } catch (err) {
    console.error('rec: getUserMedia error', err);
    displayErrors(['2 Camera access denied. Please check your browser/device settings.']);
    return;
   }
  }
 };

 const setup = async () => {
  const _player = makePlayer();
  player.set(_player);
  _player.hide();
  await checkPermissions();
  await getDeviceIds();
  console.log('userDeviceId', get(userDeviceId));
  console.log('environmentDeviceId', get(environmentDeviceId));
  _player.record().enumerateDevices();

  _player.on('enumerateReady', function () {
   console.log('rec: enumerateReady');
   const devices = _player.record().devices;
   console.log('rec: devices', devices);

   audioDevices.set(devices.filter((device: any) => device.kind === 'audioinput'));
   videoDevices.set(devices.filter((device: any) => device.kind === 'videoinput'));

   const _audioDevices = get(audioDevices);
   const _videoDevices = get(videoDevices);

   console.log('rec: audioDevices', _audioDevices);
   console.log('rec: videoDevices', _videoDevices);

   if (_videoDevices.length > 0 && _videoDevices[0].deviceId) {
    changeVideoInput(_videoDevices[0].deviceId);
   }
   if (_audioDevices.length > 0 && _audioDevices[0].deviceId) {
    changeAudioInput(_audioDevices[0].deviceId);
   }
  });
  // error handling
  _player.on('enumerateError', function () {
   console.warn('enumerate error:', _player.enumerateErrorCode);
  });

  // error handling
  _player.on('deviceError', function () {
   console.log('rec: device error:', _player.deviceErrorCode);
   displayErrors([_player.deviceErrorCode]);
  });

  _player.on('error', function (element, error) {
   console.error(error);
   displayErrors();
  });

  // user clicked the record button and started recording
  _player.on('startRecord', function () {
   console.log('rec: started recording!');
  });

  _player.on('progressRecord', function (...args) {
   console.log('rec: progressRecord!', args);
  });

  // user completed recording and stream is available
  _player.on('finishRecord', function () {
   console.log('rec: finished recording: ', _player.recordedData);
   recordedBlob.set(_player.recordedData);
  });

  _player.on('ready', function () {
   console.log('rec: ready gfdgdfgdfgg');
   loading.set(false);
   // const gd = _player.record().getDevice()
   // console.log('rec: getDevice', gd);
  });

  _player.on('deviceReady', function () {
   loading.set(false);
   console.log('rec: deviceReady', _player.record());
   _player.show();

   const stream = _player.record().stream;

   // For video input (camera)
   let videoTrack = stream.getVideoTracks()[0];
   let videoDeviceId = videoTrack.getSettings().deviceId;

   // For audio input (microphone)
   let audioTrack = stream.getAudioTracks()[0];
   let audioDeviceId = audioTrack.getSettings().deviceId;

   console.log('rec: Video Device ID:', videoDeviceId);
   console.log('rec: Audio Device ID:', audioDeviceId);

   console.log('rec: 222 Video Device ID:', _player.record().recordVideo);
   console.log('rec: 222 Audio Device ID:', _player.record().recordAudio);

   if (get(isMuted)) {
    setMute(true);
   }
  });

  return _player;
 };

 const changeVideoInput = (deviceId: string) => {
  try {
   console.log('rec: changeVideoInput', deviceId);
   get(player)?.record().setVideoInput(deviceId);
   selectedVideoDeviceId.set(deviceId);

   console.log("rec: Changed video input to '" + deviceId);
  } catch (error) {
   console.error('rec: change error', error);
  }
 };

 const changeAudioInput = (deviceId: string) => {
  try {
   console.log('rec: changeAudioInput', deviceId);
   get(player)?.record().setAudioInput(deviceId);
   selectedAudioDeviceId.set(deviceId);

   console.log("rec: Changed video input to '" + deviceId);
  } catch (error) {
   console.error('rec: change error', error);
  }
 };

 const setMute = (value: boolean) => {
  const _player = get(player);
  isMuted.set(value);

  if (!_player) {
   throw new Error('Player is not available');
  }

  const stream = _player.record().stream;
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length > 0) {
   audioTracks.forEach((audioTrack: MediaStreamTrack) => {
    audioTrack.enabled = !value;
   });
  }
 };

 const toggleMute = () => {
  setMute(!get(isMuted));
 };

 const toggleFacingMode = () => {
  const _facingMode = get(facingMode);
  const newFacingMode = _facingMode === 'user' ? 'environment' : 'user';
  facingMode.set(newFacingMode);

  const _userDeviceId = get(userDeviceId);
  const _environmentDeviceId = get(environmentDeviceId);

  if (newFacingMode === 'user' && _userDeviceId) {
   changeVideoInput(_userDeviceId);
  } else if (newFacingMode === 'environment' && _environmentDeviceId) {
   changeVideoInput(_environmentDeviceId);
  } else {
   console.warn('No deviceId available for the selected facing mode. Therefore ignoring the change.');
  }
 };

 return {
  setup,
  player,
  loading,
  error,
  errorMessages,
  audioDevices,
  videoDevices,
  selectedVideoDeviceId,
  selectedAudioDeviceId,
  changeVideoInput,
  changeAudioInput,
  recordedBlob,
  isMuted,
  toggleMute,
  facingMode,
  toggleFacingMode,
  userDeviceId,
  environmentDeviceId,
 };
}

export default useVideoRecorderSvelte;
