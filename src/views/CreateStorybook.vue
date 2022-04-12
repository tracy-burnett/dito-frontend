<template>
  <div class="flex-auto">
    <SidebarAlt />
    <div class="flex-1 flex-col h-full overflow-hidden">
      <Navbar />
      <div class="flex justify-center items-center h-full mt-10">
        <div
          class="
            flex flex-col
            items-center
            border border-gray-300
            bg-white
            shadow-md
            rounded-xl
            p-8
            xl:w-1/5
            lg:w-1/4
            md:w-1/3
          "
        >
          <h1 class="text-2xl font-bold">Upload Audio File</h1>
          <input
            class="border border-gray-300 rounded w-full mt-12 mb-3 px-3 py-1"
            type="file"
            accept="audio/*"
            ref="audioInput"
          />
          <button
            class="
              bg-indigo-500
              border border-indigo-400
              w-full
              text-sm
              px-3
              py-2
              mt-16
              rounded
              font-medium
              text-white
              hover:bg-indigo-400
              transition-colors
            "
            @click="upload"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";

export default {
  name: "CreateStorybook",
  components: {
    Navbar,
    SidebarAlt,
  },
  data() {
    return {
      ext: "",
      name: "",
      myArray: null,
      file: null,
    };
  },
  methods: {
    async upload() {
      //get secure url from server
      this.file = this.$refs.audioInput.files[0];
      this.name = this.file["name"];
      this.myArray = this.name.split(".");
      this.ext = "." + this.myArray[1];
      console.log(process.env.VUE_APP_api_URL + 's3/presignedposturl')
      const apiUrl = process.env.VUE_APP_api_URL + 's3/presignedposturl';
      fetch(apiUrl, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          ext: this.ext,

          // accessToken: this.$store.state.user.getIdToken()
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("uploading file, please wait");
          fetch(data["url"], 
          
          { method: "PUT",    
      body: this.file })
            .then((response) => console.log(response))
            .catch((error) => console.error("Error:", error));
          return data["audio_ID"];
        })
        .then((audio_ID) =>
          // post request to create new entry in audio table that includes data['audio_ID'], audio_URL (different from presigned URL), and other important information.
          {
            console.log(audio_ID);
            return;
          }
        )
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    //       accessToken: this.$store.state.user.getIdToken(),
  },
};
</script>

<style scoped>
</style>