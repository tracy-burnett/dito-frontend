<template>
    <div>
        <div class="container">
            <button @click="play" class="play">
                Play/Pause
            </button>
            <div id="current" ref="current" class="song-length">0:00</div>
            <div id="waveform" class="waveform"></div>
            <div id="length" ref="length" class="song-length">0:00</div>
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

function secondsToTime(seconds) {
    return new Date(seconds * 1000).toISOString().substr(11, 8);
}

export default {
    name: "Player",
    components: {
    },
    mounted() {
        this.$nextTick(() => {
            // https://wavesurfer-js.org
            this.wavesurfer = WaveSurfer.create({
                container: '#waveform',
                waveColor: 'grey',
                progressColor: 'purple'
            })
            // change this to load whatever audio file you want
            this.wavesurfer.load('https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3')
            
            const wavesurfer = this.wavesurfer;
            this.wavesurfer.on('ready', function () {
                document.getElementById('length').innerText = secondsToTime(wavesurfer.getDuration());
            });
            // this.$refs.length.innerText = new Date(audioLength * 1000).toISOString().substr(11, 8);
            this.wavesurfer.on('audioprocess', function() {
                // if (this.wavesurfer.isPlaying()) {
                //     var currentTime = this.wavesurfer.getCurrentTime();
                    
                // }
                // this.updateDuration();
                document.getElementById('current').innerText = secondsToTime(wavesurfer.getCurrentTime());
            });
        });
    },
    methods: {
        play() {
            this.wavesurfer.playPause()
        },
        updateDuration() {
            this.$refs.length.innerText = secondsToTime(this.wavesurfer.getDuration())
        }
    }
}
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
    width: "fill-content";
    padding: 10px;
}
.song-length {
    margin: auto;
    padding: 10px;
}
</style>