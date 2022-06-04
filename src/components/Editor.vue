<template>
  <div class="flex-auto">
    <input class="font-bold rounded w-full mt-12 mb-3 px-3 py-1" v-model="title" /><br>
    <input class="rounded w-full mt-12 mb-3 px-3 py-1" v-model="language_name" /><br>
    <textarea class="border border-gray-300 rounded w-full mt-12 mb-3 px-3 py-1" v-model="latest_text"></textarea>

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
      @click="updateText()"
    >
      Save Edits
    </button>
  </div>
</template>

<script>
export default {
  name: "Editor",
  data: () => {
    return {
      language_name: "",
      title: "",
      latest_text: "",
    };
  },
  computed: {},
  props: {

    // ID of associated audio file
    audio_id: {
      default: "",
    },

    // ID of interpretation displayed in this Editor
    interpretation_id: { default: "" },

    // whether the interpretation is owned "owner", editable "editor", or only viewable "viewer" by the logged-in user
    interpretationStatus: { default: "" },
  },
  methods: {

    // edit the text when the user clicks "Save Edits"
    updateText() {
      fetch(
        process.env.VUE_APP_api_URL +
          "interpretations/" +
          this.interpretation_id +
          "/audio/" +
          this.audio_id +
          "/" +
          this.interpretationStatus +
          "/",
        {
          method: "PATCH",
          body: JSON.stringify({
            latest_text: this.latest_text,
            title: this.title,
            language_name: this.language_name,
          }),
          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
        }
      )
        .then((response) => console.log(response))
        .catch((error) => console.error("Error:", error));
    },

  },
  mounted() {
    fetch(
      process.env.VUE_APP_api_URL +
        "interpretations/" +
        this.interpretation_id +
        "/audio/" +
        this.audio_id +
        "/" +
        this.interpretationStatus +
        "/",
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          Authorization: this.$store.state.idToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        this.title = data.interpretation.title;
        this.language_name = data.interpretation.language_name;
        this.latest_text = data.interpretation.latest_text;
      })
      .catch((error) => console.error("Error:", error));
  },
};
</script>
