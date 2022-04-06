<template>
  <div class="container rounded-full shadow-lg">
    <!-- <div id="test" ref="test" class="test">
        <input
          type="number"
          v-model="zoomnumber"
          @keyup.enter="
            {
              {
                zoom();
              }
            }
          "
        />
      </div> -->
    <div id="start" ref="start" class="start">
      <input
        type="string"
        v-model="startTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="
          {
            {
              updateRegion();
            }
          }
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
          {
            {
              seekfunction();
            }
          }
        "
      />
    </div>
    <!-- <div id="current" ref="current" class="current">00:00:00</div> -->

    <div id="waveform" ref="waveform" class="waveform"></div>
    <div id="end" ref="end" class="end">
      <input
        type="string"
        v-model="endTime"
        pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
        @keyup.enter="
          {
            {
              updateRegion();
            }
          }
        "
      />
    </div>

    <!-- <div id="test"><h1>{{currentTimeNumber}}</h1></div> -->
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
      wavesurferLoaded: false,
      zoomnumber: "",
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
        barHeight: 3,
        hideScrollbar: true,
        barRadius: 3,
        vertical: true,
        plugins: [
          //   WaveSurfer.cursor.create({
          //     showTime: true,
          //     // formatTimeCallback: function(){formattimefunction(null, arguments)},
          //     opacity: 1,
          //     customShowTimeStyle: {
          //       "background-color": "#000",
          //       color: "#fff",
          //       padding: "2px",
          //       "font-size": "10px",
          //     },
          //   }),
          WaveSurfer.regions.create(),
        ],
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
          start: temporarythis.startTime,
          end: temporarythis.endTime,
          id: "myregion",
          loop: true,
          drag: false,
        });

        // document.getElementById("length").innerText = secondsToTime(
        //   wavesurfer.getDuration()
        // );

        // wavesurfer.addRegion({
        //   start: 0,
        //   end: wavesurfer.getDuration(),
        //   id: "region",
        //   drag: false,
      });

        this.wavesurfer.on("region-update-end", function () {
      temporarythis.AfterDragStartTime = Object.values(temporarythis.wavesurfer.regions.list.region)[7];
      temporarythis.AfterDragEndTime = Object.values(temporarythis.wavesurfer.regions.list.region)[8];
      console.log(temporarythis.AfterDragStartTime);
      console.log(temporarythis.AfterDragEndTime);
          return;
        });

      this.wavesurfer.on("audioprocess", function () {
        // if (this.wavesurfer.isPlaying()) {
        //     var currentTime = this.wavesurfer.getCurrentTime();

        // }
        // this.updateDuration();
        temporarythis.currentTime = temporarythis.secondsToTime(
          temporarythis.wavesurfer.getCurrentTime()
        );

        //   if (temporarythis.currentTime > temporarythis.endTimeNumber){

        //     temporarythis.wavesurfer.pause();
        //     temporarythis.playing = !temporarythis.playing;

        //   }
      });

      //       wavesurfer.on('seek', function (position) {
      //     var currentTime = position * wavesurfer.getDuration();
      // });

      this.wavesurfer.on("seek", function (position) {
        // if (this.wavesurfer.isPlaying()) {
        //     var currentTime = this.wavesurfer.getCurrentTime();

        // }
        // this.updateDuration();

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
      });
    });
    // this.$refs.length.innerText = new Date(audioLength * 1000).toISOString().substr(11, 8);

    //   wavesurfer.on("region-click", editAnnotation);
    this.wavesurferLoaded = true;
  },

  // );
  //   },
  methods: {
    //   zoom() {

    // this.wavesurfer.zoom(Number(this.zoomnumber));
    //   },

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

      // var src = "@/assets/playAudio.svg";
      // if (this.wavesurfer.isPlaying()) {
      //     var src = "@/assets/pause.svg";
      // }
      // console.log(src);
      // document.getElementById('playImg').src = src;
    },

    secondsToTime(seconds) {
      var date = new Date(1970, 0, 1);
      date.setSeconds(seconds);
      return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    },

    //   defaultDuration() {
    //     return secondsToTime(
    //       this.wavesurfer.getDuration()
    //     );
    //   },

    // formattimefunction(seconds) {
    //     var date = new Date(1970,0,1);
    //     date.setSeconds(seconds);
    //     return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    // },

    // playfromcurrent() {
    //     this.wavesurfer.playPause(this.currentTimeNumber);
    //   this.playing = !this.playing;
    // },

    seekfunction() {
      this.wavesurfer.seekTo(this.currentSeekNumber);
      this.currentTime = this.secondsToTime(this.wavesurfer.getCurrentTime());
    },

    updateRegion() {
      this.wavesurfer.clearRegions();
      this.wavesurfer.addRegion({
        start: this.startTimeNumber,
        end: this.endTimeNumber,
        id: "region",
        loop: true,
        drag: false,
      });
      


      // currentTime() {
      //     if (!this.wavesurferLoaded){
      //         return null
      //     }
      //     return this.wavesurfer.getCurrentTime()
      // }
    },
  },
};
// function editAnnotation(region) {
//   let form = document.forms.edit;
//   console.log(region);
//   console.log(form);
//   form.style.opacity = 1;
//   (form.elements.start.value = Math.round(region.start * 10) / 10),
//     (form.elements.end.value = Math.round(region.end * 10) / 10);
//   form.elements.note.value = region.data.note || "";
//   form.onsubmit = function (e) {
//     e.preventDefault();
//     region.update({
//       start: form.elements.start.value,
//       end: form.elements.end.value,
//       data: {
//         note: form.elements.note.value,
//       },
//     });
//     form.style.opacity = 0;
//   };
//   form.onreset = function () {
//     form.style.opacity = 0;
//     form.dataset.region = null;
//   };
//   form.dataset.region = region.id;
// }
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