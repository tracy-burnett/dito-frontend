<template>
  <div class="lg:ml-16 mx-5">
    <h1 class="font-bold text-2xl mt-8 mb-6">{{ title }}</h1>
    <div class="flex items-center">
      
      <div v-for="audio in audioArray" :key="audio.ID">
        <Card
          :date="audio.uploaded_at.substring(0, 10)"
          :uploader="audio.uploaded_by.display_name"
          :description="audio.description"
          :title="audio.title"
          :audio_ID="audio.ID"
        />
        <!-- <Card /> -->
        <!-- <Card /> -->
        <!-- <Card /> -->
      </div>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Card.vue";

export default {
  data() {
    return {
      audioArray: [],
    };
  },
  name: "CardList",
  props: ["title", "cards"],
  watch: {
    "$store.state.idToken": function () {
this.getStorybooks()
    },
  },
  components: {
    Card,
  },
    mounted() {
      if (this.$store.state.idToken){
        this.getStorybooks()}
    },
  methods: {
getStorybooks() {
          // console.log(this.$store.state.user);
      // console.log(this.$store.state.idToken);
      fetch(process.env.VUE_APP_api_URL + "audio/user/", {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: this.$store.state.idToken,
        },

        // body: JSON.stringify({
        //   id_token: this.$store.state.idToken,
        // }),
      })
        .then((response) => response.json()) //json to object
        .then((data) => {
          this.audioArray = data["audio files"];
        })
        .catch((error) => console.error("Error:", error));


    
}

  }
};
</script>

<style scoped>
.flex {
  flex-wrap: wrap;
}
</style>