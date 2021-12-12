<template>
    <div>
        <div class="container">
            <button @click="play" class="play">
                Play/Pause
            </button>
            <div id="waveform" class="waveform"></div>
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
        })
    },
    methods: {
        play() {
            this.wavesurfer.playPause()
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
    margin-left: 10px;
    margin-right: 10px;
}
.play {
    width: "fill-content";
}
</style>