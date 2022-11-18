<template>
	<div
		class="flex flex-col items-center justify-center flex-1 flex-auto h-full backdrop"
		@click.self="closeModal()"
	>
		<div class="flex flex-col items-center p-8 overflow-y-scroll text-center bg-white border border-gray-300 shadow-md rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<div ref="waveform"></div>
			<h1 class="text-2xl font-bold">Divide One Storybook into Two</h1>
			<p><br>
				This action cannot be reversed.<br><br>
				Audio file and timestamped interpretations will be split into two at {{time}} seconds, which occurs immediately before the phrase(s) "{{phrase}}".<br>
			</p><br />
			<div class="flex flex-row">
				<div><button
						class="w-full px-1 py-1 text-sm font-medium text-white transition-colors border rounded left mt-7 border-sky-600 bg-sky-700 hover:bg-sky-600"
						@click="split()"
					>
						I Accept
					</button></div>
				<div class="mx-[10vw]"></div>
				<div>
					<button
						class="w-full px-1 py-1 text-sm font-medium text-white transition-colors border rounded right mt-7 border-sky-600 bg-sky-700 hover:bg-sky-600"
						@click.prevent="closeModal()"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>

	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "NewChapterModal",
	components: {},
	data() {
		return {
			time: 0,
			phrase: "",
			start: 0,
			end: 0,
			readyVerification2: 0,
		};
	},
	mounted() {
		this.time = this.$store.state.incomingCurrentTime*100;
		this.phrase = this.$store.state.substringText;
		this.start = 0;
		this.end = this.$store.state.audioDuration;
		// console.log(this.$store.state.splitAudioReady)
	},

	methods: {
		async split() {
			// this.wavesurfer = await WaveSurfer.create({
			// 	container: this.$refs.waveform,
			// 	backend: "MediaElement",
			// });
			let returnedObject = await this.splitTechnical();
			// let emptySegment = returnedObject.first;
			console.log(returnedObject);
			// let newAudioBuffer=returnedObject.second



			var firstChapterWAVBlob = await this.bufferToWave(
				returnedObject,
				0,
				returnedObject.length
			);
			// var secondChapterWAVBlob = this.bufferToWave(
			// 	newAudioBuffer,
			// 	0,
			// 	newAudioBuffer.length
			// );

            // TESTING STARTS HERE
            
            let audio = new Audio();
audio.src = URL.createObjectURL(firstChapterWAVBlob);
// this.wavesurfer.load(audio);
            
			// let that = this;
			// // When the audio file is loaded, update our data about the length of the audio file, and create a new highlighted and draggable/adjustable region that spans the entire waveform
			// this.wavesurfer.on("waveform-ready", function () {
			// 	console.log("chapter waveform ready");
			// 	that.readyVerification2 += 1;
			// });

			// // When the audio file is loaded, update our data about the length of the audio file, and create a new highlighted and draggable/adjustable region that spans the entire waveform
			// this.wavesurfer.on("ready", function () {
			// 	console.log("chapter audio ready");
			// 	that.readyVerification2 += 1;
			// });
// TESTING ENDS HERE

// WHAT DO I DO WITH THESE NOW?

// return{"first": firstChapterWAVBlob, "second": secondChapterWAVBlob}

// END WHAT
		},

		async splitTechnical() {
			console.log("starting splitTechnical");
            console.log(this.$store.state.splitAudioReady.buffer)
            console.log(this.start)
            console.log(this.time)
            console.log(this.end)
            

            var segmentDuration = this.time-this.start

var originalBuffer = this.$store.state.splitAudioReady.buffer
var emptySegment = this.$store.state.splitAudioReady.ac.createBuffer(
  originalBuffer.numberOfChannels,
  segmentDuration * originalBuffer.sampleRate,
  originalBuffer.sampleRate
);
for (var i = 0; i < originalBuffer.numberOfChannels; i++) {
  var chanData = originalBuffer.getChannelData(i);
  var emptySegmentData = emptySegment.getChannelData(i);
  var mid_data = chanData.subarray( this.start * originalBuffer.sampleRate, this.end * originalBuffer.sampleRate);
  emptySegmentData.set(mid_data);
}





return emptySegment






			// let originalAudioBuffer = this.$store.state.splitAudioReady.buffer;
			// let lengthInSamples = Math.floor(
			// 	(this.time - this.start) * originalAudioBuffer.sampleRate
			// );
			// let offlineAudioContext = this.$store.state.splitAudioReady.ac;

			// //this is prepping a container for a new audio file from beginning to middle
			// let emptySegment = offlineAudioContext.createBuffer(
			// 	originalAudioBuffer.numberOfChannels,
			// 	lengthInSamples,
			// 	originalAudioBuffer.sampleRate
			// );

			// console.log(emptySegment);

			// //this is prepping a container for the remainder of the audio file, or for some reason for the original total audio file
			// let newAudioBuffer = offlineAudioContext.createBuffer(
			// 	originalAudioBuffer.numberOfChannels,
			// 	start === 0
			// 		? originalAudioBuffer.length - emptySegment.length
			// 		: originalAudioBuffer.length,
			// 	originalAudioBuffer.sampleRate
			// );

			// for (
			// 	var channel = 0;
			// 	channel < originalAudioBuffer.numberOfChannels;
			// 	channel++
			// ) {
			// 	var new_channel_data = newAudioBuffer.getChannelData(channel);
			// 	var empty_segment_data = emptySegment.getChannelData(channel);
			// 	var original_channel_data = originalAudioBuffer.getChannelData(channel);

			// 	var before_data = original_channel_data.subarray(
			// 		0,
			// 		start * originalAudioBuffer.sampleRate
			// 	);
			// 	var mid_data = original_channel_data.subarray(
			// 		start * originalAudioBuffer.sampleRate,
			// 		end * originalAudioBuffer.sampleRate
			// 	);
			// 	var after_data = original_channel_data.subarray(
			// 		Math.floor(end * originalAudioBuffer.sampleRate),
			// 		originalAudioBuffer.length * originalAudioBuffer.sampleRate
			// 	);

			// 	empty_segment_data.set(mid_data);
			// 	// this.cutSelection = emptySegment
			// 	if (start > 0) {
			// 		new_channel_data.set(before_data);
			// 		// new_channel_data.set(empty_segment_data,(start * newAudioBuffer.sampleRate));
			// 		// new_channel_data.set(after_data,(end * newAudioBuffer.sampleRate));
			// 		new_channel_data.set(after_data, start * newAudioBuffer.sampleRate);
			// 	} else {
			// 		new_channel_data.set(after_data);
			// 	}
			// }
			// return { first: emptySegment, second: newAudioBuffer };
		},
		bufferToWave(abuffer, offset, len) {
			var numOfChan = abuffer.numberOfChannels,
				length = len * numOfChan * 2 + 44,
				buffer = new ArrayBuffer(length),
				view = new DataView(buffer),
				channels = [],
				i,
				sample,
				pos = 0;

			// write WAVE header
			setUint32(0x46464952); // "RIFF"
			setUint32(length - 8); // file length - 8
			setUint32(0x45564157); // "WAVE"

			setUint32(0x20746d66); // "fmt " chunk
			setUint32(16); // length = 16
			setUint16(1); // PCM (uncompressed)
			setUint16(numOfChan);
			setUint32(abuffer.sampleRate);
			setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
			setUint16(numOfChan * 2); // block-align
			setUint16(16); // 16-bit (hardcoded in this demo)

			setUint32(0x61746164); // "data" - chunk
			setUint32(length - pos - 4); // chunk length

			// write interleaved data
			for (i = 0; i < abuffer.numberOfChannels; i++)
				channels.push(abuffer.getChannelData(i));

			while (pos < length) {
				for (i = 0; i < numOfChan; i++) {
					// interleave channels
					sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
					sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
					view.setInt16(pos, sample, true); // update data chunk
					pos += 2;
				}
				offset++; // next source sample
			}

			// create Blob
			return new Blob([buffer], { type: "audio/mpeg" });

			function setUint16(data) {
				view.setUint16(pos, data, true);
				pos += 2;
			}

			function setUint32(data) {
				view.setUint32(pos, data, true);
				pos += 4;
			}
		},

		// // get secure url from server
		// this.file = this.$refs.audioInput.files[0];
		// this.name = this.file["name"];
		// this.myArray = this.name.split(".");
		// this.ext = "." + this.myArray[this.myArray.length - 1];
		// fetch(process.env.VUE_APP_api_URL + "s3/presignedposturl", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 		Authorization: this.$store.state.idToken,
		// 	},
		// 	body: JSON.stringify({
		// 		ext: this.ext,
		// 	}),
		// })
		// 	.then((response) => {
		// 		return response.json();
		// 	})
		// 	.then((data) => {
		// 		console.log("uploading file, please wait");
		// 		// upload audio to server
		// 		fetch(
		// 			data["url"],

		// 			{ method: "PUT", body: this.file }
		// 		)
		// 			.then((response) => {
		// 				// console.log(response);

		// 				this.$store.commit("forcePlayerRerender", data["audio_ID"]);
		// 				return;
		// 			})
		// 			.catch((error) => console.error("Error:", error));
		// 		this.name = data["audio_ID"];

		// 		return;
		// 	})
		// 	.then(() =>
		// 		// post request to create new entry in audio table that includes data['audio_ID'], audio_URL (different from presigned URL), and other important information.
		// 		{
		// 			fetch(process.env.VUE_APP_api_URL + "audio/", {
		// 				method: "POST",
		// 				headers: {
		// 					"Content-Type": "application/json",

		// 					Authorization: this.$store.state.idToken,
		// 				},
		// 				body: JSON.stringify({
		// 					id: this.name.normalize("NFC"),
		// 					// url: process.env.VUE_APP_SUBDOMAIN_URL,
		// 					title: this.title.normalize("NFC"),
		// 					description: this.description.normalize("NFC"),
		// 					// shared_with: [],
		// 				}),
		// 			})
		// 				.then((response) => {
		// 					return response.json();
		// 				})
		// 				.then((response) => {
		// 					console.log(response);
		// 				})

		// 				.then(() =>
		// 					// post request to create new interpretation for this audio
		// 					{
		// 						this.$store.commit("toggleInfobit", "InfoPublish");

		// 						if (this.int_title || this.int_text || this.int_language) {
		// 							fetch(
		// 								process.env.VUE_APP_api_URL +
		// 									"interpretations/audio/" +
		// 									this.name +
		// 									"/",
		// 								{
		// 									method: "POST",
		// 									headers: {
		// 										"Content-Type": "application/json",

		// 										Authorization: this.$store.state.idToken,
		// 									},
		// 									body: JSON.stringify({
		// 										title: this.int_title.normalize("NFC"),
		// 										latest_text: this.int_text.normalize("NFC"),
		// 										language_name: this.int_language.normalize("NFC"),
		// 										spaced_by: this.int_spacing.normalize("NFC"),
		// 										public: false,
		// 									}),
		// 								}
		// 							)
		// 								.then((response) => {
		// 									return response.json();
		// 								})
		// 								.then((response) => {
		// 									console.log(response);
		// 								})
		// 								.catch((error) => {
		// 									console.error("Error:", error);
		// 								});
		// 						}

		// 						return;
		// 					}
		// 				)
		// 				.catch((error) => {
		// 					console.error("Error:", error);
		// 				});

		// 			return;
		// 		}
		// 	)

		// 	.catch((error) => {
		// 		console.error("Error:", error);
		// 	});
		// },

		closeModal() {
			this.$emit("closeNewChapterModal");
		},
	},
};
</script>

<style scoped>
.backdrop {
	background: rgba(0, 0, 0, 0.5);
	position: fixed;
	width: 100%;
	height: 100%;
}
</style>