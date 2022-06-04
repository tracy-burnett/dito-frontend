<template>
  <div class="flex-auto h-full">
    <!-- {{title.length}} -->
    <!-- {{$store.getters.maxsize}} -->
    <input
      class="font-bold border-gray-300 rounded px-3 py-1"
      v-model="title"
      :size="titlesize"
    />
    in
    <input
      class="border-gray-300 rounded h-full px-3 py-1"
      v-model="language_name"
      :size="languagesize"
    />
    <textarea
      class="border-gray-300 rounded w-full h-full mt-12 mb-3 px-3 py-1"
      :rows="latesttextrows"
      style="overflow: hidden"
      v-model="latest_text"
    ></textarea>
    <!-- {{latest_text.length}}
{{$store.state.consoleswidth}}
{{$store.state.consoles.length}} -->

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
  computed: {
    numbernewlines() {
      return this.latest_text.split(/\r\n|\r|\n/).length;
    },
    titlesize() {
      if (
        this.title.length > 3 &&
        this.title.length < this.$store.getters.maxsize
      ) {
        return this.title.length * 1.13 - 3;
      } else if (this.title.length >= this.$store.getters.maxsize) {
        return this.$store.getters.maxsize;
      } else {
        return 1;
      }
    },
    languagesize() {
      if (
        this.language_name.length > 4 &&
        this.language_name.length < this.$store.getters.maxsize
      ) {
        return this.language_name.length * 1.27 - 4;
      } else if (this.title.length >= this.$store.getters.maxsize) {
        return this.$store.getters.maxsize;
      } else {
        return 1;
      }
    },
    // maxsize() {
    //   return this.$store.state.consoleswidth/this.$store.state.consoles.length/12-3
    // },
    latesttextrows() {
      return (
        ((6 * this.latest_text.length) /
          (this.$store.state.consoleswidth - 570)) *
          this.$store.state.consoles.length +
        this.numbernewlines
      );
      // return 20

      // if (this.latest_text.length > 25) {
      // // return Math.round(this.latest_text.length/this.$refs['edittext'].)
      // return 6
      // }
      // else {
      //   return 1
      // }
    },
  },
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
