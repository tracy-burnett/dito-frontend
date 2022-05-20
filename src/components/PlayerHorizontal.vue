<template>
<div class="outerbox rounded-xl shadow-xl">

      <div class="upperbox rounded-md">
          <input class="regionBound rounded-sm" type="string" v-model="startTime" pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
                @keyup.enter="updateRegion();"
          />
          <div class="topwave" id="topwave" ref="topwave" @wheel.prevent="getzoomnumber($event)"></div>
          <input class="regionBound rounded-sm" type="string" v-model="endTime" pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
                @keyup.enter="updateRegion();"
          />
      </div>
      
      
      <div class="lowerbox rounded-xl">
          
          <div class="head">
                <div class="button">
                    <button class="play" id="play" @click="play">
                      <div class="h-10 w-10">
                        <img v-if="playing" src="@/assets/pauseAudio.svg" />
                        <img v-else src="@/assets/playAudio.svg" />
                      </div>
                    </button>
                </div>
                <input class="current rounded-sm" type="string" v-model="currentTime" pattern="(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)"
                    @keyup.enter="updateRegion();"
                />
          </div>
        
          <div class="bottomwave" id="waveform" ref="waveform" @wheel.prevent="getzoomnumber($event)">
                <!-- audio loading display -->
                <span class="loading" v-if="loadingpercent<100" >
                        audio {{ loadingpercent }}% loaded
                </span>
          </div>
          
          <div class="zoom">
                <div class="zoomdata">Zoom:</div>
                <div class="zoomdata">{{Math.round(zoomnumber)}}</div>
          </div>
    
      </div>

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
      name: "PlayerHorizontal",
      props: {
            audio_ID: {default: "fTv6JuCXbCc.mp3",},
      },
      components: {},
      data: () => {
              return {
                loadingpercent: 0,
                wavesurferLoaded: false,
                zoomnumber: 1,
                startTime: "00:00:00",
                startSeconds: 0,
                endTime: "00:00:00",
                endSeconds: 0,
                currentTime: "00:00:00",
                totalDuration: 0,
                playing: false,
                audioURL: "",
                //   file: null,
              };
      },
      computed: {
              timeToSeconds(time) {
                      let array = time.split(":");
                      return time[0] * 3600 + time[1] * 60 + time[2];
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
                  endTimeArray[0] * 3600 +
                  endTimeArray[1] * 60 +
                  endTimeArray[2] * 1
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
                    this.wave2.load(this.audioURL);
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
                      barHeight: 1,
                      height: 70,
                      splitChannels: false,
                      hideScrollbar: true,
                      barRadius: 3,
                      vertical: false,
                      plugins: [WaveSurfer.regions.create({
                                  maxRegions: 1
                              })],
              });

              this.wave2 = WaveSurfer.create({
                      container: "#topwave",
                      // backend: "WebAudio",
                      waveColor: "#94a3b8",
                      cursorColor: "red",
                      progressColor: "#94a3b8",
                      barWidth: 2,
                      barHeight: 1,
                      height: 25,
                      splitChannels: false,
                      hideScrollbar: true,
                      barRadius: 3,
                      vertical: false,
                      plugins: [WaveSurfer.regions.create({
                                  maxRegions: 1,
                                  color: "rgb(219, 234, 254)",
                              })],
              });



              this.playing = false;
              const wavesurfer = this.wavesurfer;
              const wave2 = this.wave2;
              const temporarythis = this;
              this.wavesurfer.on("ready", function () {
                      temporarythis.totalDuration = wavesurfer.getDuration();
                      temporarythis.endTime = temporarythis.secondsToTime(temporarythis.totalDuration);
                      temporarythis.wave2.addRegion({
                        start: 0,
                        end: temporarythis.totalDuration,
                        id: "region",
                        loop: true,
                      });
                      temporarythis.wave2.enableDragSelection({
                        id: "region",
                        loop: true,
                      });
              });

              this.wave2.on("region-update-end", function () {
                      let regies = Object.keys(temporarythis.wave2.regions.list);
                      temporarythis.startSeconds = temporarythis.wave2.regions.list[regies[0]].start;
                      temporarythis.endSeconds = temporarythis.wave2.regions.list[regies[0]].end;
                      temporarythis.startTime = temporarythis.secondsToTime(
                                    temporarythis.startSeconds);
                      temporarythis.endTime = temporarythis.secondsToTime(
                                    temporarythis.endSeconds);
                      console.log(temporarythis.startTime);
                      console.log(temporarythis.endTime);

                      temporarythis.updateRegion();
              });

              this.wavesurfer.on("loading", function (progress) {
                      temporarythis.loadingpercent=progress
              });

              this.wavesurfer.on("audioprocess", function () {
                      var curr = temporarythis.wavesurfer.getCurrentTime();
                      var total = temporarythis.wavesurfer.getDuration();
                      temporarythis.currentTime = temporarythis.secondsToTime(curr);
                      temporarythis.wave2.seekTo(curr/total);
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
              });

              this.wavesurfer.on("zoom", function (minPxPerSec) {
                      // if (minPxPerSec < 1) {
                      //             minPxPerSec = 1;
                      // }
                      var secs = 1300 / minPxPerSec / 2;
                      //console.log("Zoom radius: ", secs, " seconds");
          
                      temporarythis.startSeconds = temporarythis.wavesurfer.getCurrentTime() - secs;                      
                      if (temporarythis.startSeconds < 0) {
                                  temporarythis.startSeconds = 0;
                      }
                      temporarythis.startTime = temporarythis.secondsToTime(temporarythis.startSeconds);

                      //console.log("startTime: ", temporarythis.startTime);
                      //console.log("startSeconds: ", temporarythis.startSeconds);
                      
                      temporarythis.endSeconds = temporarythis.wavesurfer.getCurrentTime() + secs;
                      if (temporarythis.endSeconds >= temporarythis.wavesurfer.getDuration()) {
                                  temporarythis.endSeconds = temporarythis.wavesurfer.getDuration();
                      }
                      temporarythis.endTime = temporarythis.secondsToTime(temporarythis.endSeconds);
                  
                      temporarythis.wave2.clearRegions();
                      temporarythis.wave2.addRegion({
                        start: temporarythis.startSeconds,
                        end: temporarythis.endSeconds,
                        id: "region",
                        loop: true,
                      });
              });

              this.wavesurferLoaded = true;
      },

      methods: {
            zoom() {
                    this.wavesurfer.zoom(this.zoomnumber);
            },

            getzoomnumber(event) {
              if ((event.deltaY <= 0 && this.zoomnumber >= 150) || (event.deltaY >= 0 && this.zoomnumber <= 1)) {
                      return;
              } else {
                      // console.log("deltaY: ", event.deltaY);
                      let isPinch = Math.abs(event.deltaY) < 50;
                      console.log("start pinch");
                      if (isPinch) {
                        // This is a pinch on a trackpad
                        let factor = 1 - 0.01 * event.deltaY;
                        this.zoomnumber *= factor;
                        // console.log("factor: ", factor);
                      } else {
                        // This is a mouse wheel
                        let strength = 1.4;
                        let factor = event.deltaY < 0 ? strength : 1.0 / strength;
                        this.zoomnumber *= factor;
                        // console.log("factor: ", factor);
                      }

                      if (this.zoomnumber <= 1) {
                                this.zoomnumber = 1;
                      }
                      if (this.zoomnumber >= 150) {
                                this.zoomnumber = 150;
                      }
                      // console.log("zoomnumber: ", this.zoomnumber);

                      this.zoom();
              }
                    //   // This is an empirically determined heuristic.
                    //   // Unfortunately I don't know of any way to do this better.
                    //   // Typical deltaY values from a trackpad pinch are under 1.0
                    //   // Typical deltaY values from a mouse wheel are more than 100.
            },

            play() {
                    // console.log(this.startTimeNumber);
                    // console.log(this.currentTimeNumber);
                    // console.log(this.endTimeNumber);
                    if (!this.wavesurfer.isPlaying()) {
                            if (
                                    this.currentTime <= this.endTime &&
                                    this.currentTime >= this.startTime
                                  ) {
                                    console.log("playing inside region");
                                    this.wavesurfer.play(this.wavesurfer.getCurrentTime());
                                    this.playing = !this.playing;
                            } else {
                                    console.log("playing from start of region");
                                    //next line should play from startTime!!!
                                    this.wavesurfer.play(this.startSeconds);
                                    this.playing = !this.playing;
                            }
                    } else if (this.wavesurfer.isPlaying()) {
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
                    this.startTime="00:00:00";
                    this.startSeconds = 0;
                    this.endTime=this.secondsToTime(this.totalDuration);
            },

            updateRegion() {
                    this.startSeconds = this.startTimeNumber;
                    this.endSeconds = this.endTimeNumber;
                    this.wave2.clearRegions();
                    this.wave2.addRegion({
                      start: this.startSeconds,
                      end: this.endSeconds,
                      id: "region",
                      loop: true,
                    });
            },
      },
};

</script>



<style scoped>

.outerbox {
  height: 98px;
}

        .upperbox {
          display: flex;
          flex-direction: row;
          justify-items: center;
          align-items: center;
          background: #e6f1f7;
          margin-bottom: 3px;
        }
                .regionBound {
                  padding-left: 2px;
                  margin-left: 3px;
                  margin-right: 3px;
                  box-sizing: border-box;
                  border: 1px solid rgb(142, 169, 188);
                  background: #e6f1f7;
                  width: 64px;
                  height: 18px;
                }
                .topwave {
                  width: 1400px;
                  height: 25px;
                  background: #e6f1f7;
                }

        .lowerbox {
          display: flex;
          background: #334155;
          height: 70px;
          align-items: center;
        }
                .head {
                  display: flex;
                  flex-direction: column;
                  min-width: 80px;
                  width: 80px;
                  align-items: center;
                }
                        
                        .play {
                          /* width: "50px"; */
                          position: relative;
                          top: 0px;
                          border-radius: 40%;
                          padding-top: 5px;
                          /*display: flex;*/
                        }
                        .current {
                          position: relative;
                          bottom: 4px;
                          padding-left: 2px;
                          width: 64px;
                          height: 18px;
                          background: #334155;
                          color: white;
                        }
                .bottomwave {
                  /* flex: 1; */
                  width: 100%;
                  height: 100%;
                  background: #dbeafe;
                  /* margin-left: 10px; */
                  /* margin-right: 10px; */
                }
                .zoom {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  width: 80px;
                  height: 100%;
                }
                .zoomdata {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-items: center;
                  color: white;
                  width: 92%;
                  height: 30%;
                }


</style>