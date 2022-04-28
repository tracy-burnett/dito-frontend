<template>
  <div class="container rounded-full shadow-lg">
    <div id="start" ref="start" class="start">
      <input
        type="string"
        v-model="startTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="updateRegion()"
      />
    </div>
    <button id="play" @click="play" class="play">
      <div class="h-10 w-10">
        <img v-if="playing" src="@/assets/pauseAudio.svg" />
        <img v-else src="@/assets/playAudio.svg" />
      </div>
    </button>
    <div id="current" ref="current" class="current">
      <input
        type="string"
        v-model="currentTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="seekfunction()"
      />
    </div>

    <div
      id="waveform"
      ref="waveform"
      class="waveform"
      @wheel.prevent="getzoomnumber($event)"
    >
      <span v-if="loadingpercent < 100"
        >audio {{ loadingpercent }}% loaded</span
      >
    </div>
    <div id="end" ref="end" class="end">
      <input
        type="string"
        v-model="endTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="updateRegion()"
      />
    </div>
    <div id="end" ref="end" class="end">
      <button @click="clearallregions()">clear highlight</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PlayerVertical",
  props: {
    audio_ID: {
      default: "fTv6JuCXbCc.mp3",
    },
  },
  components: {},
  data: () => {
    return {
      loadingpercent: 0,
      wavesurferLoaded: false,
      zoomnumber: 1,
      // nextTimestamp: 0,
      // nextnextTimestamp: 0,
      startTime: "00:00:00",
      endTime: "00:00:00",
      // i: 0,
      // j: 0,
      startTimeSeconds: 0,
      currentTimeSeconds: 0,
      endTimeSeconds: 0,
      // currentTime: "00:00:00",
      AfterDragStartTime: 0,
      AfterDragEndTime: 0,
      totalDuration: 0,
      playing: false,
      audioURL: "",
    };
  },
  computed: {

      currentTime: {
        get() {return this.$store.state.currentTime},
        set (value) {
          this.$store.commit('updateCurrentTime', value)
        }
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
      waveColor: "grey",
      progressColor: "#5D5FEF",
      barWidth: 2,
      //  barHeight: 1,
      hideScrollbar: true,
      barRadius: 3,
      vertical: true,
      plugins: [WaveSurfer.regions.create({ maxRegions: 1 })],
    });

    this.playing = false;
    const wavesurfer = this.wavesurfer;
    const temporarythis = this;
    this.wavesurfer.on("ready", function () {
      temporarythis.totalDuration = wavesurfer.getDuration();
      temporarythis.endTimeSeconds = temporarythis.totalDuration
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

      // temporarythis.identifySeekRelevantTimestamps();
    });

    this.wavesurfer.on("region-update-end", function () {
      temporarythis.AfterDragStartTime = Object.values(
        temporarythis.wavesurfer.regions.list.region
      )[7];
      temporarythis.AfterDragEndTime = Object.values(
        temporarythis.wavesurfer.regions.list.region
      )[8];
      temporarythis.startTimeSeconds = temporarythis.AfterDragStartTime
      temporarythis.startTime = temporarythis.secondsToTime(
        temporarythis.AfterDragStartTime
      );
      temporarythis.endTimeSeconds = temporarythis.AfterDragEndTime
      temporarythis.endTime = temporarythis.secondsToTime(
        temporarythis.endTimeSeconds
      );
      // console.log("new start time = " + temporarythis.startTimeSeconds)
      // console.log("current time is still " + temporarythis.currentTimeSeconds)
      // console.log("new end time = " + temporarythis.endTimeSeconds);
    });

    this.wavesurfer.on("loading", function (progress) {
      temporarythis.loadingpercent = progress;
    });

    this.wavesurfer.on("audioprocess", function () {
      temporarythis.currentTimeSeconds = temporarythis.wavesurfer.getCurrentTime()
      temporarythis.currentTime = temporarythis.secondsToTime(
        temporarythis.currentTimeSeconds
      );

      temporarythis.$store.commit(
        "updateAudioTime",
        temporarythis.currentTimeSeconds * 100
      );
      // if (
      //   (temporarythis.currentTimeSeconds * 100 <
      //     temporarythis.nextnextTimestamp &&
      //     temporarythis.nextnextTimestamp < temporarythis.nextTimestamp) ||
      //   (temporarythis.currentTimeSeconds * 100 >=
      //     temporarythis.nextTimestamp &&
      //     (temporarythis.currentTimeSeconds * 100 <
      //       temporarythis.nextnextTimestamp ||
      //       temporarythis.nextnextTimestamp <= temporarythis.nextTimestamp))
      // ) {
        // temporarythis.identifySeekRelevantTimestamps();
      // }
    });

    // this.wavesurfer.on("finish", function () {
    //   temporarythis.playing = !temporarythis.playing;
    // });

    this.wavesurfer.on("seek", function (position) {
      
          temporarythis.currentTimeSeconds = position * temporarythis.totalDuration
      if (temporarythis.playing) {
        if (
          temporarythis.currentTimeSeconds <=
            temporarythis.endTimeSeconds &&
          temporarythis.currentTimeSeconds >=
            temporarythis.startTimeSeconds
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
    // identifySeekRelevantTimestamps() {
          // console.log("duration: " + this.totalDuration)
      // this.$store.commit(
      //   "setAudioDuration",
      //   this.totalDuration * 100
      // );


//       this.i = 0;

//       while (
//         this.i < this.$store.state.triggerTimestamps.length && // while the loop has not passed the last timestamp
//         this.currentTimeSeconds * 100 >=
//           this.$store.state.triggerTimestamps[this.i] // and the audio player has passed the current timestamp
//       ) {
//         // console.log(temporarythis.$store.state.triggerTimestamps[i] + " is less than " + temporarythis.wavesurfer.getCurrentTime() * 100)

//         this.i++; // move the loop to the next timestamp
//       }
//       if (this.i == this.$store.state.triggerTimestamps.length) { // if the loop has passed the last timestamp
//         this.nextTimestamp = this.totalDuration * 100; // then set the next timestamp to the end of the audio file
//         this.j = 0
//         console.log("j = " + this.j)
//         console.log(this.$store.state.triggerTimestamps[this.j] + " should be less than " + this.startTime + " in order to run the while loop")
//         while (this.$store.state.triggerTimestamps[this.j] <= this.startTimeSeconds * 100) {
//           this.j++
//           console.log('j = ' + this.j)
//           console.log(this.$store.state.triggerTimestamps[this.j])
//         }
//         this.nextnextTimestamp = this.$store.state.triggerTimestamps[this.j]; // or whichever timestamp is first after current starttime
//         console.log("nextnextTimestamp should = " + this.$store.state.triggerTimestamps[this.j])
//         console.log("nextnextTimestamp actually = " + this.nextnextTimestamp)
//       } else {
//         this.nextTimestamp = this.$store.state.triggerTimestamps[this.i];
//         if (this.$store.state.triggerTimestamps[this.i + 1]) {
//           this.nextnextTimestamp =
//             this.$store.state.triggerTimestamps[this.i + 1];
//         } else {
//                   this.j = 0
//         while (this.$store.state.triggerTimestamps[this.j] <= this.startTime) {
//           this.j++
//         }
//           this.nextnextTimestamp = this.$store.state.triggerTimestamps[this.j]; // or whichever timestamp is first after current starttime
//         }
//       }
//       // console.log(this.nextTimestamp);
//       this.$store.commit("updateNextTimestamp", this.nextTimestamp);
//             this.$store.commit("updateNextNextTimestamp", this.nextnextTimestamp); // just for dev, can comment out in production
// //THROW EVENT RIGHT HERE TO MAKE VIEWER RE-CHECK FOR CURRENT HIGHLIGHTING
//       this.i = 0;
    // },

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
      // console.log(this.startTimeSeconds);
      // console.log(this.currentTimeSeconds); // is this always up-to-date?
      // console.log(this.endTimeSeconds);
      if (!this.playing) {
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

    seekfunction() {
      this.wavesurfer.seekTo(this.currentSeekNumber);
      this.currentTimeSeconds = this.currentTimeNumber
      this.currentTime = this.secondsToTime(this.currentTimeSeconds);
      this.$store.commit(
        "updateAudioTime",
        this.currentTimeSeconds * 100
      );
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
      this.startTimeSeconds = this.startTimeNumber
      this.endTimeSeconds = this.endTimeNumber
    },
  },
};
</script>

<style scoped>
.container {
  display: inline;
  max-width: 128px;
  text-align: center;
}
.waveform {
  /* flex: 1; */
  display: flex;
  height: 410px;
  /* margin-left: 10px; */
  /* margin-right: 10px; */
}
.play {
  /* width: "50px"; */
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 2px;
}

.start {
  padding: 5px;
}
.end {
  padding: 5px;
}

input {
  box-sizing: border-box;
}
</style>