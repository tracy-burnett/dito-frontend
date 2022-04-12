<template>
  <div class="container rounded-full shadow-lg">
    <div id="start" ref="start" class="start">
      <input
        type="string"
        v-model="startTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="

              updateRegion();

        "
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
        @keyup.enter="
  
              seekfunction();
       

        "
      />
    </div>

    <div
      id="waveform"
      ref="waveform"
      class="waveform"
      @wheel.prevent="getzoomnumber($event)"
    >    <span v-if="loadingpercent < 100">audio {{       loadingpercent  }}% loaded</span></div>
    <div id="end" ref="end" class="end">
      <input
        type="string"
        v-model="endTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="
      
              updateRegion();
       
        "
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
      startTime: "00:00:00",
      endTime: "00:00:00",
      currentTime: "00:00:00",
      AfterDragStartTime: 0,
      AfterDragEndTime: 0,
      totalDuration: 0,
      playing: false,
      audioURL: "",
      //   file: null,
    };
  },
  computed: {
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
    const apiUrl = process.env.VUE_APP_api_URL + 's3/presignedgeturl';
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
        temporarythis.endTime = temporarythis.secondsToTime(
          temporarythis.totalDuration
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
        temporarythis.startTime = temporarythis.secondsToTime(
          temporarythis.AfterDragStartTime
        );
        temporarythis.endTime = temporarythis.secondsToTime(
          temporarythis.AfterDragEndTime
        );
        console.log(temporarythis.startTime);
        console.log(temporarythis.endTime);
      });

      this.wavesurfer.on("loading", function (progress) {
        temporarythis.loadingpercent=progress

      });

      this.wavesurfer.on("audioprocess", function () {
        temporarythis.currentTime = temporarythis.secondsToTime(
          temporarythis.wavesurfer.getCurrentTime()
        );
      });

            this.wavesurfer.on("finish", function () {

            temporarythis.playing = !temporarythis.playing;
      });

      

      this.wavesurfer.on("seek", function (position) {
        if (temporarythis.playing) {
          if (
            position * temporarythis.wavesurfer.getDuration() <=
              temporarythis.endTimeNumber &&
            position * temporarythis.wavesurfer.getDuration() >=
              temporarythis.startTimeNumber
          ) {
            console.log(temporarythis.startTimeNumber);
            console.log(position * temporarythis.wavesurfer.getDuration());
            console.log(temporarythis.endTimeNumber);
            console.log("valid time");
            temporarythis.currentTime = temporarythis.secondsToTime(
              position * temporarythis.wavesurfer.getDuration()
            );
          } else {
            console.log(temporarythis.startTimeNumber);
            console.log(position * temporarythis.wavesurfer.getDuration());
            console.log(temporarythis.endTimeNumber);
            console.log("invalid time");
            temporarythis.wavesurfer.pause();
            temporarythis.playing = !temporarythis.playing;
            temporarythis.currentTime = temporarythis.secondsToTime(
              position * temporarythis.wavesurfer.getDuration()
            );
          }
        }

        temporarythis.currentTime = temporarythis.secondsToTime(
          position * temporarythis.wavesurfer.getDuration()
        );
    }
   );

    this.wavesurferLoaded = true;
  },

  methods: {
    zoom() {
      this.wavesurfer.zoom(Number(this.zoomnumber));
    },

    getzoomnumber(event) {
      console.log(event.deltaY);
      let isPinch = Math.abs(event.deltaY) < 50;
      console.log("start pinch");
      if (isPinch) {
        // This is a pinch on a trackpad
        let factor = 1 - 0.01 * event.deltaY;
        this.zoomnumber *= factor;
        console.log(this.zoomnumber);
      } else {
        // This is a mouse wheel
        let strength = 1.4;
        let factor = event.deltaY < 0 ? strength : 1.0 / strength;
        this.zoomnumber *= factor;
        console.log(this.zoomnumber);
      }
      this.zoom();

      //   // This is an empirically determined heuristic.
      //   // Unfortunately I don't know of any way to do this better.
      //   // Typical deltaY values from a trackpad pinch are under 1.0
      //   // Typical deltaY values from a mouse wheel are more than 100.
    },

    play() {
      console.log(this.startTimeNumber);
      console.log(this.currentTimeNumber);
      console.log(this.endTimeNumber);
      if (!this.playing) {
        if (
          this.currentTimeNumber <= this.endTimeNumber &&
          this.currentTimeNumber >= this.startTimeNumber
        ) {
          console.log("playing inside region");
          this.wavesurfer.play(this.currentTimeNumber);
          this.playing = !this.playing;
        } else {
          console.log("playing from start of region");
          this.wavesurfer.play(this.startTimeNumber);
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
      this.currentTime = this.secondsToTime(this.wavesurfer.getCurrentTime());
    },

    clearallregions() {
      this.wavesurfer.clearRegions();
      this.startTime="00:00:00"
      this.endTime=this.secondsToTime(
          this.totalDuration
        );
    },

    updateRegion() {
      this.wavesurfer.clearRegions();
      this.wavesurfer.addRegion({
        start: this.startTimeNumber,
        end: this.endTimeNumber,
        id: "region",
        loop: true,
      });
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