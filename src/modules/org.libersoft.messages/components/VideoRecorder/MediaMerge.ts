import { Input, BlobSource, Output, BufferTarget, Mp4OutputFormat, WebMOutputFormat, EncodedPacketSink, EncodedVideoPacketSource, EncodedAudioPacketSource, ALL_FORMATS } from 'mediabunny';

/**
 * Concatenate same-format (all mp4 OR all webm) blobs into one seekable Blob.
 * Assumptions:
 *  - All blobs are the same container (all MP4 or all WebM).
 *  - All blobs use compatible codecs (no re-encode).
 *
 * @param {Blob[]} blobs - Array of Blob/File objects
 * @param {{ preferFormat?: 'auto'|'mp4'|'webm' }} opts
 * @returns {Promise<Blob>}
 */
export async function concatSameFormatBlobs(blobs, { preferFormat = 'auto' } = {}) {
	if (!Array.isArray(blobs) || blobs.length === 0) {
		throw new Error('Provide an array with at least one Blob.');
	}
	if (blobs.length === 1) return blobs[0];

	// Build Input objects
	const inputs = blobs.map(b => new Input({ source: new BlobSource(b), formats: ALL_FORMATS }));

	// decide output format from first blob (or honor preferFormat)
	const firstMime = await inputs[0].getMimeType().catch(() => null);
	let formatChoice = preferFormat;
	if (preferFormat === 'auto') {
		formatChoice = firstMime && firstMime.includes('mp4') ? 'mp4' : 'webm';
	}
	const OutputFormat = formatChoice === 'mp4' ? Mp4OutputFormat : WebMOutputFormat;
	const outputFormatInstance = new OutputFormat();

	// create output that writes into memory
	const bufferTarget = new BufferTarget();
	const output = new Output({ format: outputFormatInstance, target: bufferTarget });

	// We'll add encoded-packet tracks based on the first input's tracks
	const firstVideoTrack = await inputs[0].getPrimaryVideoTrack().catch(() => null);
	const firstAudioTrack = await inputs[0].getPrimaryAudioTrack().catch(() => null);

	let videoPacketSource = null;
	let audioPacketSource = null;

	if (firstVideoTrack) {
		// assume codec from first track applies to all inputs
		videoPacketSource = new EncodedVideoPacketSource(firstVideoTrack.codec);
		output.addVideoTrack(videoPacketSource);
	}
	if (firstAudioTrack) {
		audioPacketSource = new EncodedAudioPacketSource(firstAudioTrack.codec);
		output.addAudioTrack(audioPacketSource);
	}

	await output.start();

	// timeline offset in the container timescale (seconds)
	let timelineOffset = 0;

	// whether we've given decoderConfig metadata to the output tracks yet
	let videoMetaGiven = false;
	let audioMetaGiven = false;

	// helper to compute duration and first timestamp for a track
	async function getTrackBounds(track) {
		if (!track) return { first: 0, duration: 0 };
		const first = await track.getFirstTimestamp().catch(() => 0);
		const end = await track.computeDuration().catch(() => first);
		return { first, duration: Math.max(0, end - first) };
	}

	// process each input sequentially
	for (const inp of inputs) {
		const vTrack = await inp.getPrimaryVideoTrack().catch(() => null);
		const aTrack = await inp.getPrimaryAudioTrack().catch(() => null);

		const vBounds = await getTrackBounds(vTrack);
		const aBounds = await getTrackBounds(aTrack);
		const segLen = Math.max(vBounds.duration, aBounds.duration);

		// copy video packets (if present)
		if (vTrack && videoPacketSource) {
			const sink = new EncodedPacketSink(vTrack);
			const decoderCfg = await vTrack.getDecoderConfig().catch(() => null);

			for await (const pkt of sink.packets()) {
				// shift packet timestamp so segment begins at timelineOffset
				const newTs = pkt.timestamp - vBounds.first + timelineOffset;
				const clone = pkt.clone({ timestamp: newTs });

				if (!videoMetaGiven) {
					const meta = decoderCfg ? { decoderConfig: decoderCfg } : undefined;
					await videoPacketSource.add(clone, meta);
					videoMetaGiven = true;
				} else {
					await videoPacketSource.add(clone);
				}
			}
		}

		// copy audio packets (if present)
		if (aTrack && audioPacketSource) {
			const sink = new EncodedPacketSink(aTrack);
			const decoderCfg = await aTrack.getDecoderConfig().catch(() => null);

			for await (const pkt of sink.packets()) {
				const newTs = pkt.timestamp - aBounds.first + timelineOffset;
				const clone = pkt.clone({ timestamp: newTs });

				if (!audioMetaGiven) {
					const meta = decoderCfg ? { decoderConfig: decoderCfg } : undefined;
					await audioPacketSource.add(clone, meta);
					audioMetaGiven = true;
				} else {
					await audioPacketSource.add(clone);
				}
			}
		}

		timelineOffset += segLen;
	}

	// finalize and grab result
	await output.finalize();
	const finalAB = bufferTarget.buffer;
	if (!finalAB) throw new Error('No output produced by mediabunny.');
	const finalMime = (await output.getMimeType().catch(() => null)) || (formatChoice === 'mp4' ? 'video/mp4' : 'video/webm');
	return new Blob([finalAB], { type: finalMime });
}
