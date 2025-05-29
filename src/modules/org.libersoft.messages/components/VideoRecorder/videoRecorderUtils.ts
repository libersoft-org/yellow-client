export function setupMicPulseIndicator(stream: MediaStream, micIndicator: HTMLElement) {
	// @ts-ignore
	const audioContext = new (window.AudioContext || window.webkitAudioContext)();
	const micSource = audioContext.createMediaStreamSource(stream);
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = 512;

	const dataArray = new Uint8Array(analyser.frequencyBinCount);
	micSource.connect(analyser);

	let smoothedVolume = 0;
	const smoothingFactor = 0.2; // smaller = smoother (try 0.1–0.3)

	function animateMic() {
		analyser.getByteFrequencyData(dataArray);

		let sum = 0;
		for (let i = 0; i < dataArray.length; i++) {
			sum += dataArray[i] * dataArray[i];
		}
		const rms = Math.sqrt(sum / dataArray.length);

		// Smooth the volume using easing
		smoothedVolume += (rms - smoothedVolume) * smoothingFactor;

		// Use smoothed volume for animation
		const scale = Math.min(1 + smoothedVolume / 50, 3);
		micIndicator.style.transform = `scale(${scale.toFixed(2)})`;
		micIndicator.style.opacity = `${Math.min(smoothedVolume / 40, 1).toFixed(2)}`;

		const avg = sum / dataArray.length;

		if (avg > 20) {
			// Adjust threshold as needed
			micIndicator.classList.add('active');
		} else {
			micIndicator.classList.remove('active');
		}

		requestAnimationFrame(animateMic);
	}

	animateMic();
}
