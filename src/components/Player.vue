
<template>
    <div class="container rounded-full shadow-lg">
        <button id="play" @click="play" class="play">
            <div class="h-10 w-10">
                <img v-if="playing" src="@/assets/pauseAudio.svg"/>
                <img v-else src="@/assets/playAudio.svg"/>
            </div>
        </button>
        <div id="current" ref="current" class="current">00:00:00</div>

        <form role="form" name="edit">

        <div id="start" ref="start" class="start"> <input type = "number" value ="0"> </div>
        </form>
        <div id="waveform" class="waveform"></div>
         <form role="form" name="edit">
        <div id="length" ref="length" class="song-length"><input type = "number"></div>
        </form>
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
    name: "Player",
    props: ["audio",  "region"],
    components: {
    },
    data: () => {
        return {
            playing: false,
        }
    },
    mounted() {
        this.$nextTick(() => {
            // https://wavesurfer-js.org
            this.wavesurfer = WaveSurfer.create({
                container: '#waveform',
                waveColor: 'grey',
                progressColor: '#5D5FEF',
                barWidth: 2,
                barRadius: 3,
                vertical: true,
                plugins: [
                    WaveSurfer.cursor.create({
                        showTime: true,
                        opacity: 1,
                        customShowTimeStyle: {
                            'background-color': '#000',
                            color: '#fff',
                            padding: '2px',
                            'font-size': '10px'
                            }    
                        }),
                    WaveSurfer.regions.create(),
                    ]
                });
            var audio = this.audio;
            if (!this.audio) {
                // change this to load whatever audio file you want
                audio = "https://archive.org/download/huck_finn_librivox/huckfinn_08_twain_apc.mp3"
        
            }
            this.wavesurfer.load(audio);
            

            this.playing = false;
            const wavesurfer = this.wavesurfer;

            this.wavesurfer.on('ready', function () {
                document.getElementById('length').innerText = secondsToTime(wavesurfer.getDuration());
                region = wavesurfer.addRegion({
                    start:0,
                    end: wavesurfer.getDuration(),
                    id: 'region',
                    drag: false
                     });
                
            });
            // this.$refs.length.innerText = new Date(audioLength * 1000).toISOString().substr(11, 8);
            this.wavesurfer.on('audioprocess', function() {
                // if (this.wavesurfer.isPlaying()) {
                //     var currentTime = this.wavesurfer.getCurrentTime();
                    
                // }
                // this.updateDuration();
                document.getElementById('current').innerText = secondsToTime(wavesurfer.getCurrentTime());
            });
            wavesurfer.on('region-click', editAnnotation);

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
        updateDuration() {
            this.$refs.length.innerText = secondsToTime(this.wavesurfer.getDuration())
        },
      
    }
}
function editAnnotation(region) {
    let form = document.forms.edit;
    console.log(region);
    console.log(form);
    form.style.opacity = 1;
    (form.elements.start.value = Math.round(region.start * 10) / 10),
    (form.elements.end.value = Math.round(region.end * 10) / 10);
    form.elements.note.value = region.data.note || '';
    form.onsubmit = function(e) {
        e.preventDefault();
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
            data: {
                note: form.elements.note.value
            }
        });
        form.style.opacity = 0;
    };
    form.onreset = function() {
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;
}  
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

.current {
    padding: 5px;
}
.song-length {
    padding: 5px;
}
input{
    box-sizing:border-box;
    } 

</style>