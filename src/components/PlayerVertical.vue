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

		this.wavesurfer.load(https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav);



		this.wavesurfer.on('error', function (err) {
			console.warn("error", err?.message || err);
		});


	},

};
</script>

<style scoped>

.container {
	/* height: 80vh; */
	/* min-height: 600px; */
	/* width: 7vw; */
	width: 100px;
	position: relative;
	/* left: 10px; */
	/* margin-top: 1vh; */
	margin-left: 0.2vw;
	/* top: 5px; */
	display: inline;
	/*max-width: 7%;*/
	text-align: center;
	background: #334155;
	/*background: linear-gradient(90deg, #164e63, 30%, #1e293b, 70%, #164e63);*/
}

.waveform {
	/* flex: 1; */
	display: flex;
	height: 30vh;
	width: 75px;
	/* margin-left: 10px; */
	background: #dbeafe;

	/* background: linear-gradient(90deg, #155E75, #64748B, #155E75) */
	/* margin-left: 10px; */
	/* margin-right: 10px; */
}

.midwaveform {
	display: flex;
	/* height: 79vh; */
	width: 1px;
	height: 30vh;
	background: #dbeafe;
}

.miniwaveform {
	/* flex: 1; */
	display: flex;
	/* height: 79vh; */
	width: 24px;
	background: #dbeafe;

	/* background: linear-gradient(90deg, #155E75, #64748B, #155E75) */
	/* margin-left: 10px; */
	/* margin-right: 10px; *
		height: 80vh;
	/* min-height: 600px; */
	/* width: 7vw; */
	/* position: relative; */
	/* left: 10px; */
	/* margin-top: 1vh; */
	/* margin-left: 0.2vw; */
	/* top: 5px; */
	/* display: inline; */
	/*max-width: 7%;*/
	/* text-align: center; */
	/*background: linear-gradient(90deg, #164e63, 30%, #1e293b, 70%, #164e63);*/
}
	
.disabled {
	font-size: 70%;
	color: white;
	text-align: center;
	position: relative;
	/* margin-top: -1vh; */
	height: 18px;
	width: 99%;
	/* margin-bottom: 2vh; */
	/*background: radial-gradient(#798597, #616977);*/
	background: #475569;
}

.clear {
	font-size: 70%;
	color: white;
	text-align: center;
	position: relative;
	/* margin-top: -1vh; */
	height: 18px;
	width: 99%;
	/* margin-bottom: 2vh; */
	/*background: radial-gradient(#798597, #616977);*/
	background: #475569;
}

.clear:hover {
	border-width: 2px;
	border-color: white;
}

.clear:active {
	/*background: radial-gradient(#636c7a, #94a3b8);*/
	/*transform: translateX(1px) translateY(1px);*/
	background: white;
}

/* .loading { */
/* display: flex; */
/* margin-left: 15%; */
/* } */

.play {
	/* width: "50px"; */
	position: relative;

	/* padding-left: -10px; */
	padding-top: 1vh;
}

.play:active {
	transform: translateX(1px) translateY(1px);
}

.start {
	position: relative;
	/* top: 3px; */
	height: 3vh;
}

.current {
	position: relative;
	/* top: -5px; */
	height: 3vh;
}

.end {
	height: 3vh;
	/* top: 5px; */
	/* padding: 5px; */
}

input {
	box-sizing: border-box;
	/*border: slategray solid 1px;*/
	width: 80px;
	/*width: 65px;
  height: 18px;*/
	position: relative;
	/* left: 100% - 65px; */
	/*background-color: #e2e8f0;*/
	background: transparent;
	color: white;
	/* border-radius: 15%; */
	border-radius: 3px;
	text-align: center;
}

.tibetantiny {
	font-size: 1.125rem
		/* 14px */
	;
	line-height: 1.75rem
		/* 20px */
	;
}

.nottibetantiny {
	font-size: 0.75rem
		/* 14px */
	;
	line-height: 1rem
		/* 20px */
	;
}

.tibetan {
	font-size: 1.25rem
		/* 14px */
	;
	padding-bottom: 5vh;
}

.nottibetan {
	font-size: 0.875rem
		/* 14px */
	;
	line-height: 1.25rem
		/* 20px */
	;
}
</style>
