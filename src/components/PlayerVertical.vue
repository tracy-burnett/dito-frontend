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
      <!-- audio loading display -->
      <span
        class="flex loading flex-col justify-center"
        v-if="loadingpercent < 100"
      >
        audio {{ loadingpercent }}% loaded
      </span>
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
  name: "PlayerVertical",
  props: {
    audio_ID: {
      default: "",
    },
  },
  components: {},
  data: () => {
    return {
      loadingpercent: 0,
      wavesurferLoaded: false,
      zoomnumber: 1,
      startTime: "00:00:00",
      endTime: "00:00:00",
      AfterDragStartTime: 0,
      startTimeSeconds: 0,
      currentTimeSeconds: 0,
      endTimeSeconds: 0,
      AfterDragEndTime: 0,
      totalDuration: 0,
      playing: false,
      audioURL: "",
    };
  },
  watch: {
    "$store.state.incomingCurrentTime": function () {
      this.seekTimestampfunction(this.$store.state.incomingCurrentTime);
    },
  },
  computed: {
    currentTime: {
      get() {
        return this.$store.state.currentTime;
      },
      set(value) {
        this.$store.commit("updateCurrentTime", value);
      },
    },
    startTimeNumber() {
      let startTimeArray = this.startTime.split(":");
      return (
        startTimeArray[0] * 3600 +
        startTimeArray[1] * 60 +
        startTimeArray[2] * 1
      );
    },
    endTimeNumber() {
      let endTimeArray = this.endTime.split(":");
      return (
        endTimeArray[0] * 3600 + endTimeArray[1] * 60 + endTimeArray[2] * 1
      );
    },
    currentTimeNumber() {
      let currentTimeArray = this.currentTime.split(":");
      return (
        currentTimeArray[0] * 3600 +
        currentTimeArray[1] * 60 +
        currentTimeArray[2] * 1
      );
    },
    currentSeekNumber() {
      return this.currentTimeNumber / this.totalDuration;
    },
  },
  created() {},
  mounted() {
    //get secure url from server
    console.log(this.audio_ID);
    const apiUrl = process.env.VUE_APP_api_URL + "s3/presignedgeturl";
    fetch(apiUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: this.$store.state.idToken,
      },

      body: JSON.stringify({
        audio_ID: this.audio_ID,

        // accessToken: this.$store.state.user.getIdToken()
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

    this.playing = false;
    const wavesurfer = this.wavesurfer;
    const temporarythis = this;
    this.wavesurfer.on("ready", function () {
      temporarythis.totalDuration = wavesurfer.getDuration();
      temporarythis.endTimeSeconds = temporarythis.totalDuration;
      temporarythis.endTime = temporarythis.secondsToTime(
        temporarythis.endTimeSeconds
      );
      wavesurfer.addRegion({
        start: 0,
        end: temporarythis.totalDuration,
        id: "region",
        loop: true,
      });
      wavesurfer.enableDragSelection({
        id: "region",
        loop: true,
      });
    });

    this.wavesurfer.on("region-update-end", function () {
      temporarythis.AfterDragStartTime = Object.values(
        temporarythis.wavesurfer.regions.list.region
      )[7];
      temporarythis.AfterDragEndTime = Object.values(
        temporarythis.wavesurfer.regions.list.region
      )[8];
      temporarythis.startTimeSeconds = temporarythis.AfterDragStartTime;
      temporarythis.startTime = temporarythis.secondsToTime(
        temporarythis.startTimeSeconds
      );
      temporarythis.endTimeSeconds = temporarythis.AfterDragEndTime;
      temporarythis.endTime = temporarythis.secondsToTime(
        temporarythis.endTimeSeconds
      );
    });

    this.wavesurfer.on("loading", function (progress) {
      temporarythis.loadingpercent = progress;
    });

    this.wavesurfer.on("audioprocess", function () {
      temporarythis.currentTimeSeconds =
        temporarythis.wavesurfer.getCurrentTime();
      temporarythis.currentTime = temporarythis.secondsToTime(
        temporarythis.currentTimeSeconds
      );

      temporarythis.$store.commit(
        "updateAudioTime",
        temporarythis.currentTimeSeconds * 100
      );
    });

    //       this.wavesurfer.on("finish", function () {

    //       temporarythis.playing = !temporarythis.playing;
    // });

    this.wavesurfer.on("seek", function (position) {
      temporarythis.currentTimeSeconds = position * temporarythis.totalDuration;
      if (temporarythis.playing) {
        if (
          temporarythis.currentTimeSeconds <= temporarythis.endTimeSeconds &&
          temporarythis.currentTimeSeconds >= temporarythis.startTimeSeconds
        ) {
          // console.log(temporarythis.startTimeNumber);
          // console.log(temporarythis.currentTimeSeconds);
          // console.log(temporarythis.endTimeSeconds);
          // console.log("valid time");
          temporarythis.currentTime = temporarythis.secondsToTime(
            temporarythis.currentTimeSeconds
          );
        } else {
          // console.log(temporarythis.startTimeSeconds);
          // console.log(temporarythis.currentTimeSeconds);
          // console.log(temporarythis.endTimeSeconds);
          // console.log("invalid time");
          temporarythis.wavesurfer.pause();
          temporarythis.playing = !temporarythis.playing;
          temporarythis.currentTime = temporarythis.secondsToTime(
            temporarythis.currentTimeSeconds
          );
        }
      }
      temporarythis.currentTime = temporarythis.secondsToTime(
        temporarythis.currentTimeSeconds
      );
      temporarythis.$store.commit(
        "updateAudioTime",
        temporarythis.currentTimeSeconds * 100
      );
      // temporarythis.identifySeekRelevantTimestamps();
    });
    this.wavesurferLoaded = true;
  },

  methods: {
    zoom() {
      this.wavesurfer.zoom(Number(this.zoomnumber));
    },

    getzoomnumber(event) {
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
      }
      this.zoom();

      //   // This is an empirically determined heuristic.
      //   // Unfortunately I don't know of any way to do this better.
      //   // Typical deltaY values from a trackpad pinch are under 1.0
      //   // Typical deltaY values from a mouse wheel are more than 100.
    },

    play() {
      // console.log(this.startTimeNumber);
      // console.log(this.currentTimeNumber);
      // console.log(this.endTimeNumber);
      if (!this.playing) {
        this.currentTimeSeconds = this.currentTimeNumber;
        if (
          this.currentTimeSeconds <= this.endTimeSeconds &&
          this.currentTimeSeconds >= this.startTimeSeconds
        ) {
          // console.log("playing inside region");
          this.wavesurfer.play(this.currentTimeSeconds);
          this.playing = !this.playing;
        } else {
          // console.log("playing from start of region");
          this.wavesurfer.play(this.startTimeSeconds);
          // this.identifySeekRelevantTimestamps();
          this.playing = !this.playing;
        }
      } else if (this.playing) {
        this.wavesurfer.pause();
        this.playing = !this.playing;
      }
    },
    secondsToTime(seconds) {
      var date = new Date(1970, 0, 1);
      date.setSeconds(seconds);
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    },

    pausePlayer() {
      this.wavesurfer.pause();
      this.playing = false;
    },
    seekTimestampfunction(timestamp) {
      console.log(timestamp + " is in milliseconds");
      this.wavesurfer.seekTo(timestamp / this.totalDuration);
      this.currentTimeSeconds = timestamp;
      console.log(this.currentTimeSeconds + " is in seconds");
      this.currentTime = this.secondsToTime(this.currentTimeSeconds);
      console.log(this.currentTime + " is in HH:MM:SS");
      // this.identifySeekRelevantTimestamps();
    },

    seekfunction() {
      this.wavesurfer.seekTo(this.currentSeekNumber);
      this.currentTimeSeconds = this.currentTimeNumber;
      this.currentTime = this.secondsToTime(this.currentTimeSeconds);
      this.$store.commit("updateAudioTime", this.currentTimeSeconds * 100);
      // this.identifySeekRelevantTimestamps();
    },
    clearallregions() {
      this.wavesurfer.clearRegions();
      this.startTime = "00:00:00";
      this.endTime = this.secondsToTime(this.totalDuration);
    },

    updateRegion() {
      this.wavesurfer.clearRegions();
      this.wavesurfer.addRegion({
        start: this.startTimeNumber,
        end: this.endTimeNumber,
        id: "region",
        loop: true,
      });
      this.startTimeSeconds = this.startTimeNumber;
      this.endTimeSeconds = this.endTimeNumber;
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
  left: 10px;
  top: 5px;
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