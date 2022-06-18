<template>
  <div class="lg:ml-16 mx-5">
    <h1 class="font-bold text-2xl mt-8 mb-6">{{ title }}</h1>
    <div class="flex items-center">
      <!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->
      <div v-for="audio in audioArray" :key="audio.id">
        <Card
          :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
          :uploader="audio.uploaded_by.display_name"
          :description="audio.description"
          :title="audio.title"
          :audio_ID="audio.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Card.vue";

export default {
  data() {
    return {
      audioArray: [], // the list of audio files owned by, or shared with, the logged-in user
    };
  },
  name: "PublicCardList",
  props: ["title"],
  // watch: {
  //   "$store.state.idToken": function () {
  //     this.getStorybooks();
  //   },
    
  // },
  components: {
    Card,
  },
  mounted() {
    // if (this.$store.state.idToken) {
      this.getStorybooks();
    // }
  },
  methods: {
    getStorybooks() {
      fetch(process.env.VUE_APP_api_URL + "audio/", {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          // Authorization: this.$store.state.idToken,
        },
      })
        .then((response) => response.json()) // json to object
        .then((data) => {
          this.audioArray = data["audio"]; // collect the list of audio files that are owned by, or shared with, the logged-in user
        })
        .catch((error) => console.error("Error:", error));
    },
  },
};
</script>

<style scoped>
.flex {
  flex-wrap: wrap;
}
</style>