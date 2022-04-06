<template>
  <div class="container rounded-full shadow-lg items-center">
    <button id="play" @click="play" class="play">
      <div class="h-10 w-10">
        <img v-if="playing" src="@/assets/pauseAudio.svg" />
        <img v-else src="@/assets/playAudio.svg" />
      </div>
    </button>
    <div id="current" ref="current" class="current">00:00:00</div>
    <div id="waveform" ref="waveform" class="waveform"></div>
    <div id="length" ref="length" class="song-length">00:00:00</div>
  </div>

  <!-- <div class="lg:mx-16 mx-5">
        <h1 class="font-bold text-2xl mt-10 mb-7">Audio Player</h1>
        <audio controls>
            <source src="https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3" type="audio/mpeg">
            Your browser does not support the audio tag.
        </audio>
        <audio/>
    </div> -->
</template>

<script>
function secondsToTime(seconds) {
  return new Date(seconds * 1000).toISOString().substr(11, 8);
}

export default {
  name: "PlayerHorizontal",
  props: {
    audio_ID: {
      default: "hcGrwbxNrO8.mp3",
    },
    //     vertical: {
    //   default: false,
    // },
  },
  components: {},
  data: () => {
    return {
      playing: false,
      audioURL: "",
      //   file: null,
    };
  },
  created() {},
  mounted() {
    //get secure url from server
    console.log(this.audio_ID);
    const apiUrl = "http://localhost:8000/api/s3/presignedgeturl";
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
        console.log(this.audioURL);
        this.wavesurfer.load(this.audioURL);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    this.$nextTick(() => {
      // https://wavesurfer-js.org
      this.wavesurfer = WaveSurfer.create({
        container: this.$refs.waveform,
        backend: "MediaElement",
        waveColor: "grey",
        progressColor: "#5D5FEF",
        barWidth: 2,
        barRadius: 3,
        height: 50,
        barHeight: 3,
        hideScrollbar: true,
      });

      this.playing = false;
      const wavesurfer = this.wavesurfer;
      this.wavesurfer.on("ready", function () {
        document.getElementById("length").innerText = secondsToTime(
          wavesurfer.getDuration()
        );
      });
      // this.$refs.length.innerText = new Date(audioLength * 1000).toISOString().substr(11, 8);

      this.wavesurfer.on("audioprocess", function () {
        // if (this.wavesurfer.isPlaying()) {
        //     var currentTime = this.wavesurfer.getCurrentTime();

        // }
        // this.updateDuration();
        document.getElementById("current").innerText = secondsToTime(
          wavesurfer.getCurrentTime()
        );
      });

    });
  },
  methods: {
    play() {
      this.wavesurfer.playPause();
      this.playing = !this.playing;
      // var src = "@/assets/playAudio.svg";
      // if (this.wavesurfer.isPlaying()) {
      //     var src = "@/assets/pause.svg";
      // }
      // console.log(src);
      // document.getElementById('playImg').src = src;
    },
    // updateDuration() {
    //   this.$refs.length.innerText = secondsToTime(
    //     this.wavesurfer.getDuration()
    //   );
    // },
  },
};
</script>

<style scoped>
.container {
  display: flex;
}
.waveform {
  /* flex: 1; */
  width: 100%;
  /* margin-left: 10px; */
  /* margin-right: 10px; */
}
.play {
  /* width: "50px"; */
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 2px;
}

.current {
  padding: 5px;
}
.song-length {
  padding: 5px;
}
</style>