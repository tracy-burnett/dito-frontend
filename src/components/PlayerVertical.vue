<template>
  <!-- audio player body -->
  <div class="container rounded-xl shadow-xl">
    <!-- top-most time entry box (for start of view window) -->
    <div id="start" ref="start" class="start">
      <input
        type="string"
        v-model="startTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="updateRegion()"
      />
    </div>

    <!-- play button -->
    <button id="play" @click="play" class="play">
      <div class="h-10 w-10">
        <img v-if="playing" src="@/assets/pauseAudio.svg" />
        <img v-else src="@/assets/playAudio.svg" />
      </div>
    </button>

    <!-- middle time entry box (for current time) -->
    <div id="current" ref="current" class="current">
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
      <span v-if="loadingpercent > 0">
        <span
          class="flex loading flex-col justify-center"
          v-if="loadingpercent < 100"
        >
          audio {{ loadingpercent }}% loaded
        </span>
      </span>
      <span v-else
        >please be patient while your audio file is uploaded to the server</span
      >
    </div>

    <!-- bottom-most time entry box (for end of view window) -->
    <div id="end" ref="end" class="end">
      <input
        type="string"
        v-model="endTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="updateRegion()"
      />
    </div>

    <!-- clear highlight button -->
    <div id="end" ref="end" class="end">
      <button class="clear rounded-full" @click="clearallregions()">
        Clear Highlight
      </button>
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
      loadingpercent: 0,
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
    };
  },

  // watch these variables to see if they change.  if they do, then call the corresponding functions.
  watch: {
    "$store.state.incomingCurrentTime": function () {
      this.seekTimestampfunction(this.$store.state.incomingCurrentTime);
    },
    "$store.state.playerRerender": function () {
      this.shouldRerender(this.$store.state.playerRerender);
    },
  },

  // these are variables whose values are dynamically updated when necessary.
  computed: {
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

  mounted() {
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
        this.audioURL = data["url"];
        this.wavesurfer.load(this.audioURL);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // https://wavesurfer-js.org
    this.wavesurfer = WaveSurfer.create({
      container: this.$refs.waveform,
      backend: "WebAudio",
      waveColor: "#94a3b8",
      cursorColor: "red",
      progressColor: "#475569",
      barWidth: 2,
      //  barHeight: 1,
      hideScrollbar: true,
      barRadius: 3,
      vertical: true,
      plugins: [
        WaveSurfer.regions.create({
          maxRegions: 1,
        }),
      ],
    });

    const that = this;

    // When the audio file is loaded, update our data about the length of the audio file, and create a new highlighted and draggable/adjustable region that spans the entire waveform
    this.wavesurfer.on("ready", function () {
      that.totalDuration = that.wavesurfer.getDuration();
      that.endTimeSeconds = that.totalDuration;
      that.endTime = that.secondsToTime(
        that.endTimeSeconds
      );
      that.wavesurfer.addRegion({
        start: 0,
        end: that.totalDuration,
        id: "region",
        loop: true,
      });
      that.wavesurfer.enableDragSelection({
        id: "region",
        loop: true,
      });
    });

    // whenever the highlighted region or either of its bounds is dragged, update our data about where the region begins and ends accordingly
    this.wavesurfer.on("region-update-end", function () {
      that.startTimeSeconds = Object.values(
        that.wavesurfer.regions.list.region
      )[7];
      that.endTimeSeconds = Object.values(
        that.wavesurfer.regions.list.region
      )[8];
      that.startTime = that.secondsToTime(
        that.startTimeSeconds
      );
      that.endTime = that.secondsToTime(
        that.endTimeSeconds
      );
    });

    // calculate how much of the audio file has been loaded, so far
    this.wavesurfer.on("loading", function (progress) {
      that.loadingpercent = progress;
    });

    // whenever the audio is playing, update our data about where we are in the file accordingly, including in the Vuex store
    this.wavesurfer.on("audioprocess", function () {
      that.currentTimeSeconds =
        that.wavesurfer.getCurrentTime();
      that.currentTime = that.secondsToTime(
        that.currentTimeSeconds
      );
      that.$store.commit(
        "updateAudioTime",
        Math.round(that.currentTimeSeconds * 100)
      );
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
      that.currentTime = that.secondsToTime(
        that.currentTimeSeconds
      );
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
      }
      this.$emit("rerenderPlayer");
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
      this.wavesurfer.seekTo(timestamp / this.totalDuration);
      this.currentTime = this.secondsToTime(timestamp);
    },

    // when the user submits a new manual input of HH:MM:SS current time, the cursor moves accordingly and the change is also communicated to the Vuex store
    seekfunction() {
      this.wavesurfer.seekTo(this.currentSeekNumber);
    },

    // clear the highlighted region and reset the HH:MM:SS displays of start and end time accordingly
    clearallregions() {
      this.wavesurfer.clearRegions();
      this.startTime = "00:00:00";
      this.endTime = this.secondsToTime(this.totalDuration);
    },

    // change the highlighted region based on manual HH:MM:SS inputs of start and end times by the user
    updateRegion() {
      this.wavesurfer.clearRegions();
      this.wavesurfer.addRegion({
        start: this.startTimeNumber,
        end: this.endTimeNumber,
        id: "region",
        loop: true,
      });
      this.startTimeSeconds = this.startTimeNumber; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
      this.endTimeSeconds = this.endTimeNumber; // wavesurfer's "region-update-end" event doesn't catch this so I am doing it manually here
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
  height: 85vh;
  min-height: 600px;
  width: 8vw;
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
  height: 410px;
  background: #dbeafe;

  /* background: linear-gradient(90deg, #155E75, #64748B, #155E75) */
  /* margin-left: 10px; */
  /* margin-right: 10px; */
}

.loading {
  display: flex;
  margin-left: 30%;
}

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