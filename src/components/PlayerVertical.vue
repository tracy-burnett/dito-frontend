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

		this.wavesurfer.load("https://citizen-dj.labs.loc.gov/audio/samplepacks/loc-american-english-dialect-recordings/Conversation-with-10-year-old-black-female-Washington-DC_afccal000391_002_00-05-36.mp3");
				
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
