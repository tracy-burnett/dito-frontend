<template>
	<div>
			<!-- waveform display -->

				<div id="waveform" ref="waveform" class="flex waveform"></div>


	</div>
</template>

<script>

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
			audioURL: "",
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
			progressColor: "#475569",
			barHeight: 4,
			hideScrollbar: true,
			vertical: true,
		});

		this.audioURL = "https://tile.loc.gov/storage-services/media/afc/cal/afc1986022_sr09b02.mp3"

		this.wavesurfer.load(this.audioURL);
				
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

.container {
	width: 100px;
	position: relative;
	margin-left: 0.2vw;
	display: inline;
}

.waveform {
	height: 30vh;
	width: 75px;

}

	

</style>
