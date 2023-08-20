<template>
	<div>
			<!-- waveform display -->

				<div id="waveform" ref="waveform" class="waveform"></div>


	</div>
</template>

<script>
	
import { getIdToken } from "firebase/auth";

export default {
	// name of component
	name: "PlayerVertical",

	// declare the variables and default values that this component will need
	data: () => {
		return {
			audioURL: "",
		};
	},
	props: {
		audio_ID: {
			default: "",
		},
	},

	unmounted() {
		this.wavesurfer.destroy();
	},

	mounted() {

		
		// https://wavesurfer-js.org
		this.wavesurfer = WaveSurfer.create({
			container: this.$refs.waveform,
			waveColor: "#94a3b8",
			progressColor: "#475569",
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
				this.audioURL = data["url"];
				if (data["peaks"]) {
					console.log("loading peaks from backend!")
					console.log(data["peaks"])
					console.log(JSON.parse(data["peaks"]))
					// console.log(Math.max(...JSON.parse(data["peaks"])))
					// console.log(JSON.parse(data["peaks"]).reduce((max, v) => max >= v ? max : v, -Infinity))

					this.wavesurfer.load(this.audioURL, JSON.parse(data["peaks"]));
					this.$store.commit("updatePeaksData", data["peaks"])
				} else {
					// console.log("generating new peaks on frontend")
					this.wavesurfer.load(this.audioURL);
					this.sendtobackendBoolean = true;
				}
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	
		this.wavesurfer.on('error', function (err) {
			console.warn("error", err?.message || err);
		});
		this.wavesurfer.on('decode', function () {
			console.log("audio has been loaded")
		})
		this.wavesurfer.on('ready', function () {
			console.log("waveform should be viewable now")
		});
	},

};
</script>

<style scoped>
	
.waveform {
	z-index: 50;
	height: 200px;
	width: 700px;
	background-color: white;
	position: absolute;
}
	
</style>
