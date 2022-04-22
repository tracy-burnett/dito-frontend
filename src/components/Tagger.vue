<template>
  <div class="flex-auto">
    Display text here for filename {{ audio_filename }}.<br /><br />
    {{ latest_text }}
    
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
      @click="updateAssociations()"
    >
      Save Tags
    </button>

  </div>
</template>

<script>
export default {
  name: "Tagger",
  data: () => {
    return {
      latest_text: "Hello hello hello",
      associations: {
        "": [],
      },
    };
  },
  props: {
    audio_filename: {
      default: "fTv6JuCXbCc.mp3",
    },
    audio_id: {
      default: 6,
    },
    interpretation_id: {
      default: 2,
    },
  },
  methods: {
updateAssociations() {
    fetch(process.env.VUE_APP_api_URL +
      "audio/" +
      this.audio_id +
      "/translations/" +
      this.interpretation_id +
      "/associations/", {
      method: "POST",
        body: JSON.stringify({
    "text": "For one thing", // Pass in a string that meets a minimum character count and includes all the new tags you want to save
    "associations": '{ 1: 2000, 2: 1500, 3: 1700 }' // Pass in the list of the new tags
}),
      headers: {
        "Content-Type": "application/json",
      },
    })
    //   .then((response) => response.json())
    //   .then((data) => (this.latest_text = data.text))
      .catch((error) => console.error("Error:", error));
}



  },
  mounted() {
    const apiUrl =
      process.env.VUE_APP_api_URL +
      "audio/" +
      this.audio_id +
      "/translations/" +
      this.interpretation_id +
      "/";
    fetch(apiUrl, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => (this.latest_text = data.text))
      .catch((error) => console.error("Error:", error));
  },
};
</script>
