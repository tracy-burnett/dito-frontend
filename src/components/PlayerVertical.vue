<template>
	<div>
			<!-- waveform display -->

				<div id="waveform" ref="waveform" class="waveform"></div>


	</div>
</template>

<script>

export default {
	// name of component
	name: "PlayerVertical",

	// declare the variables and default values that this component will need
	data: () => {
		return {
			audioURL: "",
		};
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

		this.wavesurfer.load("https://tile.loc.gov/storage-services/media/afc/cal/afc1986022_sr09b02.mp3");
				
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
	height: 20px;
	width: 700px;
	background-color: white;
	position: absolute;
}
	
</style>
