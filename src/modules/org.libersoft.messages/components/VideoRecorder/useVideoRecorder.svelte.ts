import videoJS from 'video.js';
import 'recordrtc';
import { get, writable } from 'svelte/store';

type VideoJSWithRecorder = ReturnType<typeof videoJS> & {
	record: any;
	recordedData: Blob;
	enumerateErrorCode: string;
	deviceErrorCode: string;
};

function useVideoRecorderSvelte(getVideoRef: () => HTMLVideoElement | undefined, opts: any) {
	const player = writable<VideoJSWithRecorder>();
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
			//const msg = 'Using video.js ' + videoJS.VERSION + ' with videojs-record ' + videoJS.getPluginVersion('record') + ' and recordrtc ' + RecordRTC.version;
			//videoJS.log(msg);
		}) as VideoJSWithRecorder;
	};
	async function getDeviceIds() {
		try {
			// First enumerate devices to see what's available
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = devices.filter(device => device.kind === 'videoinput');

			if (videoDevices.length === 0) {
				console.warn('rec: No video devices found during enumeration');
				return;
			}

			// Only try to get specific facing modes if we have devices
			try {
				// Query front camera (user-facing)
				const frontCameraStream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'user' },
				});
				const frontCameraTrack = frontCameraStream.getVideoTracks()[0];
				const frontDeviceId = frontCameraTrack.getSettings().deviceId;
				userDeviceId.set(frontDeviceId || null);
				frontCameraStream.getTracks().forEach(track => track.stop());
			} catch (err) {
				console.warn('rec: Could not access user-facing camera:', err);
			}

			try {
				// Query rear camera (environment-facing)
				const rearCameraStream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'environment' },
				});
				const rearCameraTrack = rearCameraStream.getVideoTracks()[0];
				const rearDeviceId = rearCameraTrack.getSettings().deviceId;
				environmentDeviceId.set(rearDeviceId || null);
				rearCameraStream.getTracks().forEach(track => track.stop());
			} catch (err) {
				console.warn('rec: Could not access environment-facing camera:', err);
			}
		} catch (err) {
			console.error('Error getting devices:', err);
			// Don't display errors here as this is just for facing mode detection
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
		try {
			// @ts-ignore
			const permissions = await navigator.permissions.query({ name: 'camera' });
			console.info('rec: permissions', permissions);

			if (permissions.state === 'denied') {
				displayErrors(['Camera access denied. Please check your browser/device settings.']);
				return false;
			} else if (permissions.state === 'prompt') {
				try {
					// Request only video permission initially to avoid Firefox issues
					const stream = await navigator.mediaDevices.getUserMedia({ video: true });
					// Stop the stream immediately after getting permission
					stream.getTracks().forEach(track => track.stop());
					console.log('rec: Camera permission granted');
				} catch (err) {
					console.error('rec: getUserMedia error', err);
					const errorMessage = err instanceof Error ? err.message : 'Unknown error';
					if (errorMessage.includes('NotFoundError') || errorMessage.includes('object can not be found')) {
						displayErrors(['No camera device found. Please ensure a camera is connected.']);
					} else if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
						displayErrors(['Camera access denied. Please allow camera access and try again.']);
					} else {
						displayErrors(['Failed to access camera: ' + errorMessage]);
					}
					return false;
				}
			}
			return true;
		} catch (err) {
			console.error('rec: Permission check error', err);
			// Firefox might not support permissions API for camera
			return true; // Continue anyway
		}
	};

	const setup = async () => {
		const _player = makePlayer();
		player.set(_player);
		_player.hide();

		const permissionGranted = await checkPermissions();
		if (!permissionGranted) {
			loading.set(false);
			return _player;
		}

		await getDeviceIds();
		_player.record().enumerateDevices();

		_player.on('enumerateReady', function () {
			console.log('rec: enumerateReady');
			const devices = _player.record().devices;
			console.log('rec: devices', devices);

			const audioInputs = devices.filter((device: any) => device.kind === 'audioinput');
			const videoInputs = devices.filter((device: any) => device.kind === 'videoinput');

			console.log('rec: audio devices:', audioInputs);
			console.log('rec: video devices:', videoInputs);

			// Debug: Check for duplicate deviceIds
			const videoDeviceIds = videoInputs.map((d: InputDeviceInfo) => d.deviceId);
			console.log('rec: video deviceIds:', videoDeviceIds);
			if (videoDeviceIds.length !== new Set(videoDeviceIds).size) {
				console.warn('rec: Duplicate video deviceIds detected!');
			}

			// Remove duplicates by deviceId, keeping first occurrence
			const uniqueVideoInputs = videoInputs.filter((device: InputDeviceInfo, index: number, self: InputDeviceInfo[]) => index === self.findIndex((d: InputDeviceInfo) => d.deviceId === device.deviceId));
			const uniqueAudioInputs = audioInputs.filter((device: InputDeviceInfo, index: number, self: InputDeviceInfo[]) => index === self.findIndex((d: InputDeviceInfo) => d.deviceId === device.deviceId));

			audioDevices.set(uniqueAudioInputs);
			videoDevices.set(uniqueVideoInputs);

			const _audioDevices = get(audioDevices);
			const _videoDevices = get(videoDevices);

			// Request device first before trying to change inputs
			console.log('rec: calling getDevice()');

			// Small delay for Firefox to properly initialize
			setTimeout(async () => {
				// For now, only request video to avoid Firefox issues
				if (uniqueVideoInputs.length > 0) {
					console.log('rec: Requesting video only (Firefox compatibility)');

					// First test if we can get a stream directly
					try {
						const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
						console.log('rec: Direct getUserMedia successful, got stream:', testStream);
						testStream.getTracks().forEach(track => track.stop());

						// If direct access works, try with the plugin
						_player.record().getDevice({
							audio: false,
							video: true,
						});
					} catch (err) {
						console.error('rec: Direct getUserMedia failed:', err);
						const errorMessage = err instanceof Error ? err.message : String(err);
						displayErrors(['Failed to access camera directly. Error: ' + errorMessage]);
					}
				} else {
					console.log('rec: No video devices found');
					displayErrors(['No video devices found. Please ensure a camera is connected.']);
				}
			}, 100);
		});

		// error handling
		_player.on('enumerateError', function () {
			console.warn('enumerate error:', _player.enumerateErrorCode);
		});

		// error handling
		_player.on('deviceError', function () {
			console.log('rec: device error:', _player.deviceErrorCode);
			const errorCode = _player.deviceErrorCode;

			if (errorCode && errorCode.toString().includes('NotFoundError')) {
				displayErrors(['No camera device found. Please ensure a camera is connected and refresh the page.']);
			} else if (errorCode && errorCode.toString().includes('NotAllowedError')) {
				displayErrors(['Camera access was denied. Please allow camera access in your browser settings.']);
			} else if (errorCode && errorCode.toString().includes('NotReadableError')) {
				displayErrors(['Camera is already in use by another application. Please close other apps using the camera.']);
			} else {
				displayErrors(['Camera error: ' + (errorCode ? errorCode.toString() : 'Unknown error')]);
			}
		});

		_player.on('error', function (element, error) {
			console.error(error);
			displayErrors();
		});

		// user clicked the record button and started recording
		_player.on('startRecord', function () {
			console.log('rec: started recording!');
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
			console.log('rec: deviceReady event fired');
			loading.set(false);
			_player.show();

			if (get(isMuted)) {
				setMute(true);
			}

			// Don't try to change devices immediately after deviceReady
			// as it can cause issues in Firefox
			const stream = _player.record().stream;
			if (stream) {
				const videoTracks = stream.getVideoTracks();
				const audioTracks = stream.getAudioTracks();
				console.log('rec: deviceReady - video tracks:', videoTracks.length);
				console.log('rec: deviceReady - audio tracks:', audioTracks.length);

				if (videoTracks.length > 0) {
					const settings = videoTracks[0].getSettings();
					console.log('rec: deviceReady - video settings:', settings);
					selectedVideoDeviceId.set(settings.deviceId || null);
				}

				if (audioTracks.length > 0) {
					const settings = audioTracks[0].getSettings();
					selectedAudioDeviceId.set(settings.deviceId || null);
				}
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
