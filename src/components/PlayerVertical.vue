<template>
	<div>
			<!-- waveform display -->

				<div id="waveform" ref="waveform" class="flex waveform"></div>


	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	// name of component
	name: "PlayerVertical",

	// data that it inherits from parent component
	props: {
		audio_ID: {
			default: "",
		},
		playerPlayPause: {
			default: 0,
		},
	},

	// declare the variables and default values that this component will need
	data: () => {
		return {
			playbackspeed: 1,
			isLoaded: false,
			loadingpercent: 0,
			readyVerification: 0,
			// peaksData: [],
			zoomnumber: 0,
			sendtobackendBoolean: false,
			startTime: "00:00:00", // the beginning of the highlighted region as calculated by wavesurfer OR manually input by the user, in HH:MM:SS
			currentTime: "00:00:00", // wherever the audio is currently playing as calculated by wavesurfer OR manually input by the user, in HH:MM:SS
			endTime: "00:00:00", // the end of the highlighted region as calculated by wavesurfer OR manually input by the user, in HH:MM:SS
			startTimeSeconds: 0, // the beginning of the highlighted region as calculated by wavesurfer, in seconds
			currentTimeSeconds: 0, // wherever the audio is currently playing as calculated by wavesurfer, in seconds
			endTimeSeconds: 0, // the end of the highlighted region as calculated by wavesurfer, in seconds
			totalDuration: 0, // the total length of the audio, in seconds
			playing: false,
			audioURL: "",
			updatingFromPrompter: false,
			repeat: false,
			hasRegion: false,
			autoscroll: true,
		};
	},


	unmounted() {
		this.wavesurfer.destroy();
	},

	async mounted() {

		// https://wavesurfer-js.org
		this.wavesurfer = WaveSurfer.create({
			container: this.$refs.waveform,
			waveColor: "#94a3b8",
			cursorColor: "red",
			// autoCenter: false,
			progressColor: "#475569",
			// barWidth: 2,
			barHeight: 4,
			// normalize: true,
			hideScrollbar: true,
			// barRadius: 3,
			vertical: true,
		});


		if (this.$store.state.user) {
			// REFRESH ID TOKEN FIRST AND WAIT FOR IT
			await getIdToken(this.$store.state.user)
				.then((idToken) => {
					this.$store.commit("SetIdToken", idToken);
					// console.log(this.$store.state.idToken)
				})
				.catch((error) => {
					// An error happened.
					console.log("Oops. " + error.code + ": " + error.message);
				});
		}

		//get secure url from server
		const apiUrl = process.env.VUE_APP_api_URL + "s3/presignedgeturl";
		fetch(apiUrl, {
			method: "POST",

			headers: {
				"Content-Type": "application/json",
				Authorization: this.$store.state.idToken,
			},

			body: JSON.stringify({
				audio_ID: this.audio_ID,
			}),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				// console.log(data)
				this.audioURL = https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav

				this.wavesurfer.load(this.audioURL);
				
			})
			.catch((error) => {
				console.error("Error:", error);
			});


		this.wavesurfer.on('error', function (err) {
			console.warn("error", err?.message || err);
		});
		
		this.wavesurfer.on('ready', function () {
			console.log("waveform should be viewable now")
		});


	},

};
</script>

<style scoped>

.container {
	width: 100px;
	position: relative;
	margin-left: 0.2vw;
	display: inline;
	background: #334155;
}

.waveform {
	height: 30vh;
	width: 75px;
	background: #dbeafe;

}

	

</style>
