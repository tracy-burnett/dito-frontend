<template>
	<div
		class="flex flex-col h-[20vh] mt-[2vh]"
		style="position:fixed;"
	>

		<!-- playback speed slider -->
		<div class="flex justify-center text-xs">
			playback speed {{playbackspeed}}x
			<!-- <br>{{startTimeSeconds}} -->
			<!-- <br>{{(startTimeSeconds+endTimeSeconds)/2}}<br>{{endTimeSeconds}} -->
		</div>
		<div>
			<input
				id="slider"
				v-model="playbackspeed"
				type="range"
				min=".2"
				max="1.5"
				step=".10"
				style="width: 16vh"
			/>
		</div>
		<!-- <div class="flex justify-center text-xs">{{playbackspeed}}</div> -->
		<!-- audio player body -->
		<div class="container shadow-xl rounded-xl">
			<!-- top-most time entry box (for start of view window) -->
			<div
				id="start"
				ref="start"
				class="start"
			>
				<input
					type="string"
					v-model="startTime"
					pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
					@keyup.enter="updateRegion()"
				/>
			</div>

			<!-- play button -->
			<button
				id="play"
				@click="play"
				class="play"
			>
				<div class="w-10 h-10">
					<img
						v-if="playing"
						src="@/assets/pauseAudio.svg"
					/>
					<img
						v-else
						src="@/assets/playAudio.svg"
					/>
				</div>
			</button>

			<!-- middle time entry box (for current time) -->
			<div
				id="current"
				ref="current"
				class="current"
			>
				<input
					type="string"
					v-model="currentTime"
					pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
					@click="pausePlayer()"
					@keyup.enter="seekfunction()"
				/>
			</div>

			<!-- waveform display -->
			<div
				id="waveform"
				ref="waveform"
				class="flex waveform"
				@wheel.prevent="getzoomnumber($event)"
			>
				<span
					class="flex flex-col justify-center pl-6"
					v-if="loadingpercent > 0 && loadingpercent < 100"
				>
					audio {{ loadingpercent }}% loaded
				</span>
				<span
					class="flex flex-col justify-center pl-4"
					v-else-if="loadingpercent==0"
				>please be patient while your audio file is uploaded to the server</span>
			</div>

			<!-- bottom-most time entry box (for end of view window) -->
			<div
				id="end"
				ref="end"
				class="end"
			>
				<input
					type="string"
					v-model="endTime"
					pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
					@keyup.enter="updateRegion()"
				/>
			</div>

			<!-- clear highlight button -->
			<div
				id="end"
				ref="end"
				class="end"
			>
				<button
					class="rounded-full clear"
					@click="clearallregions()"
				>
					Clear Highlight
				</button>
			</div>
		</div>
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
	},

	// declare the variables and default values that this component will need
	data: () => {
		return {
			playbackspeed: 1,
			isLoaded: false,
			loadingpercent: 0,
			// peaksData: [],
			zoomnumber: 1,
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
		};
	},

	// watch these variables to see if they change.  if they do, then call the corresponding functions.
	watch: {
		playbackspeed: function () {
			this.wavesurfer.setPlaybackRate(this.playbackspeed);
		},
		"$store.state.incomingCurrentTime": function () {
			if (
				this.$store.state.incomingCurrentTime >= this.startTimeSeconds &&
				this.$store.state.incomingCurrentTime < this.endTimeSeconds
			) {
				this.seekTimestampfunction(this.$store.state.incomingCurrentTime);
			} else if (
				this.$store.state.incomingCurrentTime < this.startTimeSeconds
			) {
				let tempendtime = this.endTimeSeconds;
				this.wavesurfer.clearRegions();
				this.updatingFromPrompter = false;
				this.wavesurfer.addRegion({
					start: this.$store.state.incomingCurrentTime,
					end: tempendtime,
					id: "region",
					loop: false,
				});
				this.startTime = this.secondsToTime(
					Math.round(this.$store.state.incomingCurrentTime)
				);
				this.endTime = this.secondsToTime(Math.round(tempendtime));
				this.seekTimestampfunction(this.$store.state.incomingCurrentTime);
			} else if (this.$store.state.incomingCurrentTime >= this.endTimeSeconds) {
				let tempendtime = this.endTimeSeconds;
				this.wavesurfer.clearRegions();
				this.updatingFromPrompter = false;
				this.wavesurfer.addRegion({
					start: this.$store.state.incomingCurrentTime,
					end: this.totalDuration,
					id: "region",
					loop: false,
				});
				this.startTime = this.secondsToTime(
					Math.round(this.$store.state.incomingCurrentTime)
				);
				this.endTime = this.secondsToTime(Math.round(this.totalDuration));
				this.seekTimestampfunction(this.$store.state.incomingCurrentTime);
			}
			// this.startTimeSeconds = this.$store.state.startTimePrompter; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			// this.endTimeSeconds = this.$store.state.endTimePrompter; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			if (!this.playing) {
				this.play();
			} else if (this.playing) {
				this.play();
				this.play();
			}
		},
		"$store.state.playerRerender": function () {
			this.shouldRerender(this.$store.state.playerRerender);
		},
		"$store.state.regionRerender": function () {
			// console.log(this.$store.state.startTimePrompter)
			// console.log(this.$store.state.endTimePrompter)
			this.startTime = this.secondsToTime(
				Math.round(this.$store.state.startTimePrompter)
			);
			this.endTime = this.secondsToTime(
				Math.round(this.$store.state.endTimePrompter)
			);
			// console.log(this.startTimeNumber)
			// console.log(this.endTimeNumber)
			this.updateRegionFromPrompter();
		},
	},

	// these are variables whose values are dynamically updated when necessary.
	computed: {
		// the beginning of the highlighted region as edited by Prompter, in HH:MM:SS
		// startTimePrompter: {
		// 	// getter
		// get() {
		// 	return this.$store.state.startTimePrompter; // in the store
		// },
		// set(startTimePrompter) {
		// 	this.$store.commit("updateStartTimePrompter", startTimePrompter);
		// },
		// },

		// the end of the highlighted region as edited by Prompter, in HH:MM:SS
		// endTimePrompter: {
		// 	// getter
		// 	get() {
		// 		return this.$store.state.endTimePrompter; // in the store
		// 	},
		// set(endTimePrompter) {
		// 	this.$store.commit("updateEndTimePrompter", endTimePrompter);
		// },
		// },

		// the beginning of the highlighted region as manually typed in by the user, in seconds
		startTimeNumber() {
			let startTimeArray = this.startTime.split(":");
			return (
				startTimeArray[0] * 3600 +
				startTimeArray[1] * 60 +
				startTimeArray[2] * 1
			);
		},

		// the end of the highlighted region as manually typed in by the user, in seconds
		endTimeNumber() {
			let endTimeArray = this.endTime.split(":");
			return (
				endTimeArray[0] * 3600 + endTimeArray[1] * 60 + endTimeArray[2] * 1
			);
		},

		// wherever the audio is currently playing as manually typed in by the user, in seconds
		currentTimeNumber() {
			let currentTimeArray = this.currentTime.split(":");
			return (
				currentTimeArray[0] * 3600 +
				currentTimeArray[1] * 60 +
				currentTimeArray[2] * 1
			);
		},

		// the wavesurfer "number" that the user wants to seek to, based on their manual editing of the current time HH:MM:SS
		currentSeekNumber() {
			return this.currentTimeNumber / this.totalDuration;
		},
	},

	unmounted() {
		this.wavesurfer.destroy();
	},

	mounted() {
		//get secure url from server
		this.$store.commit("updateAudioDuration", 0);
		this.$store.commit("removePeaksData");
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
				this.audioURL = data["url"];
				this.wavesurfer.load(this.audioURL);
			})
			.catch((error) => {
				console.error("Error:", error);
			});

		// https://wavesurfer-js.org
		this.wavesurfer = WaveSurfer.create({
			container: this.$refs.waveform,
			backend: "MediaElement",
			waveColor: "#94a3b8",
			cursorColor: "red",
			progressColor: "#475569",
			// barWidth: 2,
			barHeight: 4,
			normalize: true,
			hideScrollbar: true,
			// barRadius: 3,
			vertical: true,
			plugins: [
				WaveSurfer.regions.create({
					maxRegions: 1,
				}),
			],
		});

		const that = this;

		// When the audio file is loaded, update our data about the length of the audio file, and create a new highlighted and draggable/adjustable region that spans the entire waveform
		this.wavesurfer.on("waveform-ready", function () {
			that.isLoaded = true;
			that.totalDuration = that.wavesurfer.getDuration();
			that.$store.commit("updateAudioDuration", that.totalDuration * 1000);
			that.endTimeSeconds = that.totalDuration;
			that.endTime = that.secondsToTime(that.endTimeSeconds);
			that.wavesurfer.addRegion({
				start: 0,
				end: that.totalDuration,
				id: "initialregion",
				loop: false,
			});
			that.wavesurfer.enableDragSelection({
				id: "initialregion",
				loop: false,
			});

			// length of output array/2, accuracy (irrelevant), don't popup a new window, start at 0,
			that.wavesurfer
				.exportPCM((that.totalDuration / 2) * 100, 10000, true, 0)
				.then(function (result) {
					that.$store.commit("updatePeaksData", result);
				});
		});

		// whenever the highlighted region or either of its bounds is dragged, update our data about where the region begins and ends accordingly
		this.wavesurfer.on("region-update-end", (region, event) => {
			// console.log(region)
			that.startTimeSeconds = region.start;
			that.endTimeSeconds = region.end;
			// console.log(that.startTimeSeconds)
			// console.log(that.endTimeSeconds)
			// that.startTime = that.secondsToTime(that.startTimeSeconds);
			// that.endTime = that.secondsToTime(that.endTimeSeconds);
			that.$store.commit("updateStartTimePrompter", that.startTimeSeconds);
			that.$store.commit("updateEndTimePrompter", that.endTimeSeconds);
			that.$store.commit("forceTriggerNewText");

			that.startTime = that.secondsToTime(
				Math.round(that.$store.state.startTimePrompter)
			);
			that.endTime = that.secondsToTime(
				Math.round(that.$store.state.endTimePrompter)
			);
		});

		this.wavesurfer.on("region-created", (region, event) => {
			// console.log(region);
			if (that.updatingFromPrompter == false) {
				// console.log("creating region, not from prompter");
				that.startTimeSeconds = region.start;
				that.endTimeSeconds = region.end;
				// console.log(that.startTimeSeconds)
				// console.log(that.endTimeSeconds)
				// that.startTime = that.secondsToTime(that.startTimeSeconds);
				// that.endTime = that.secondsToTime(that.endTimeSeconds);
				that.$store.commit("updateStartTimePrompter", that.startTimeSeconds);
				that.$store.commit("updateEndTimePrompter", that.endTimeSeconds);
				if (region.id != "initialregion") {
					that.$store.commit("forceTriggerNewText");
				}
			} else if (that.updatingFromPrompter == true) {
				// console.log("creating region from prompter");
				that.startTimeSeconds = that.$store.state.startTimePrompter;
				that.endTimeSeconds = that.$store.state.endTimePrompter;
				that.updatingFromPrompter = false;
			}

			// that.startTime=that.secondsToTime(Math.round(that.$store.state.startTimePrompter))
			// that.endTime=that.secondsToTime(Math.round(that.$store.state.endTimePrompter))
		});

		// calculate how much of the audio file has been loaded, so far
		this.wavesurfer.on("loading", function (progress) {
			that.loadingpercent = progress;
		});

		// whenever the audio is playing, update our data about where we are in the file accordingly, including in the Vuex store
		this.wavesurfer.on("audioprocess", function () {
			that.currentTimeSeconds = that.wavesurfer.getCurrentTime();
			that.currentTime = that.secondsToTime(that.currentTimeSeconds);
			that.$store.commit(
				"updateAudioTime",
				Math.round(that.currentTimeSeconds * 100)
			);
			if (
				that.currentTimeSeconds >= that.endTimeSeconds &&
				that.isLoaded == true
			) {
				that.wavesurfer.seekTo(that.startTimeSeconds / that.totalDuration);
			}
		});

		this.wavesurfer.on("finish", function () {
			that.wavesurfer.seekTo(that.startTimeSeconds / that.totalDuration);
			that.pausePlayer();
			that.play();
		});

		// whenever the audio jumps from one position to another for whatever reason, if the audio is playing but the cursor is now out of bounds of the highlighted region, then pause the player
		this.wavesurfer.on("seek", function (position) {
			that.currentTimeSeconds = position * that.totalDuration;
			if (
				that.playing &&
				(that.currentTimeSeconds < that.startTimeSeconds ||
					that.currentTimeSeconds > that.endTimeSeconds)
			) {
				that.pausePlayer();
			}
			// regardless whether the cursor is dropped inside or outside of the highlighted region, update the data about where we are in the audio file, both within this component and in the Vuex store.
			that.currentTime = that.secondsToTime(that.currentTimeSeconds);
			that.$store.commit(
				"updateAudioTime",
				Math.round(that.currentTimeSeconds * 100)
			);
		});
	},

	methods: {
		// if we get news that this audio file just completed being uploaded, then rerender this audio player
		shouldRerender(incomingID) {
			if (incomingID == this.audio_ID) {
				this.$emit("rerenderPlayer");
			}
		},

		zoom() {
			this.wavesurfer.zoom(Number(this.zoomnumber));
		},

		getzoomnumber(event) {
			if (
				(event.deltaY <= 0 && this.zoomnumber >= 150) ||
				(event.deltaY >= 0 && this.zoomnumber <= 1)
			) {
				return;
			} else {
				// console.log(event.deltaY);
				let isPinch = Math.abs(event.deltaY) < 50;
				// console.log("start pinch");
				if (isPinch) {
					// This is a pinch on a trackpad
					let factor = 1 - 0.01 * event.deltaY;
					this.zoomnumber *= factor;
					// console.log(this.zoomnumber);
				} else {
					// This is a mouse wheel
					let strength = 1.4;
					let factor = event.deltaY < 0 ? strength : 1.0 / strength;
					this.zoomnumber *= factor;
					// console.log(this.zoomnumber);

					if (this.zoomnumber <= 1) {
						this.zoomnumber = 1;
					}
					if (this.zoomnumber >= 150) {
						this.zoomnumber = 150;
					}
				}
				this.zoom();
			}
			//   // This is an empirically determined heuristic.
			//   // Unfortunately I don't know of any way to do this better.
			//   // Typical deltaY values from a trackpad pinch are under 1.0
			//   // Typical deltaY values from a mouse wheel are more than 100.
		},

		play() {
			if (!this.playing) {
				// when the player starts playing, make sure it plays from whenever is currently displayed in the "current time" box that the user is also able to manually inpput into, unless of course that value is outside of the highlighted region
				if (
					this.currentTimeNumber <= this.endTimeSeconds &&
					this.currentTimeNumber >= this.startTimeSeconds
				) {
					// console.log("playing inside region");
					this.wavesurfer.play(this.currentTimeNumber);
					this.playing = !this.playing;
				} else {
					// console.log("playing from start of region");
					this.wavesurfer.play(this.startTimeSeconds);
					this.playing = !this.playing;
				}
			} else if (this.playing) {
				// if you click "pause," then pause the player
				this.pausePlayer();
			}
		},

		// convert a value from seconds to HH:MM:SS
		secondsToTime(seconds) {
			var date = new Date(1970, 0, 1);
			date.setSeconds(seconds);
			return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		},

		pausePlayer() {
			this.wavesurfer.pause();
			this.playing = false;
		},

		// when the user clicks in the "Viewer" component, it starts playing the audio player from this timestamp and updates the HH:MM:SS display of current time accordingly
		seekTimestampfunction(timestamp) {
			if (this.totalDuration > 0) {
				this.wavesurfer.seekTo(timestamp / this.totalDuration);
				this.currentTime = this.secondsToTime(timestamp);
			}
		},

		// when the user submits a new manual input of HH:MM:SS current time, the cursor moves accordingly and the change is also communicated to the Vuex store
		seekfunction() {
			this.wavesurfer.seekTo(this.currentSeekNumber);
		},

		// clear the highlighted region and reset the HH:MM:SS displays of start and end time accordingly
		clearallregions() {
			// console.log("in clear regions")
			this.wavesurfer.clearRegions();
			// console.log(this.updatingFromPrompter);
			this.startTime = "00:00:00";
			this.endTime = this.secondsToTime(this.totalDuration);
			// console.log("end time: " + this.endTime)
			this.startTimeSeconds = 0; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			this.endTimeSeconds = this.totalDuration; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here			this.$store.commit(
			this.$store.commit("updateStartTimePrompter", 0);
			this.$store.commit("updateEndTimePrompter", this.totalDuration);
		},

		// change the highlighted region based on manual HH:MM:SS inputs of start and end times by the user
		updateRegion() {
			this.wavesurfer.clearRegions();
			// console.log("end time: " + this.endTime)
			this.wavesurfer.addRegion({
				start: this.startTimeNumber,
				end: this.endTimeNumber,
				id: "region",
				loop: false,
			});
			// this.startTimeSeconds = this.startTimeNumber; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			// this.endTimeSeconds = this.endTimeNumber; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			// this.$store.commit(
			// 	"updateStartTimePrompter",
			// 	this.startTimeSeconds
			// );
			// this.$store.commit(
			// 	"updateEndTimePrompter",
			// 	this.endTimeSeconds
			// );
		},

		// change the highlighted region based on manual HH:MM:SS inputs of start and end times by the user
		updateRegionFromPrompter() {
			this.wavesurfer.clearRegions();
			this.updatingFromPrompter = true;
			this.wavesurfer.addRegion({
				start: this.$store.state.startTimePrompter,
				end: this.$store.state.endTimePrompter,
				id: "region",
				loop: false,
			});
			this.startTime = this.secondsToTime(
				Math.round(this.$store.state.startTimePrompter)
			);
			this.endTime = this.secondsToTime(
				Math.round(this.$store.state.endTimePrompter)
			);
			// this.startTimeSeconds = this.$store.state.startTimePrompter; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			// this.endTimeSeconds = this.$store.state.endTimePrompter; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
			if (!this.playing) {
				this.play();
			} else if (this.playing) {
				this.play();
				this.play();
			}
		},
	},
};
</script>

<style scoped>
.clear {
	font-size: 70%;
	color: white;
	text-align: center;
	position: relative;
	top: 5px;
	height: 22px;
	width: 94%;
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

.container {
	/* height: 100vh; */
	/* min-height: 600px; */
	width: 4vw;
	min-width: 100px;
	position: relative;
	/* left: 10px; */
	margin: 5px;
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
	height: 55vh;
	background: #dbeafe;

	/* background: linear-gradient(90deg, #155E75, #64748B, #155E75) */
	/* margin-left: 10px; */
	/* margin-right: 10px; */
}

/* .loading { */
/* display: flex; */
/* margin-left: 15%; */
/* } */

.play {
	/* width: "50px"; */
	position: relative;
	top: -0.5px;
	padding-left: -10px;
	padding-top: 8px;
}

.play:active {
	transform: translateX(1px) translateY(1px);
}

.start {
	padding: 5px;
	position: relative;
	top: 3px;
}

.current {
	position: relative;
	top: -5px;
}

.end {
	top: 5px;
	padding: 5px;
}

input {
	box-sizing: border-box;
	/*border: slategray solid 1px;*/
	width: 65px;
	/*width: 65px;
  height: 18px;*/
	position: relative;
	left: 100% - 65px;
	/*background-color: #e2e8f0;*/
	background: #334155;
	color: white;
	/* border-radius: 15%; */
	border-radius: 3px;
	text-align: center;
}
</style>