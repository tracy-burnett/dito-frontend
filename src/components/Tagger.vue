<template>
  <div class="flex-auto">
    <span class="font-bold border-gray-300 rounded px-3 py-1">{{ title }}</span>
    in <span class="border-gray-300 rounded px-3 py-1">{{ language_name }}</span
    ><br />
    <!-- {{new_associations}} -->
    <!-- for each character in the array of characters for the text, display it and if the user clicks on it, tag or untag it, depending on whether it has already been tagged in this session or not -->
    <div class="border-gray-300 rounded w-full h-full mt-12 mb-3 px-3 py-1">
      <span
        v-for="character in latest_text_character_array"
        :key="character.index"
      >
        <span v-if="!character.newtag">
          <span
            @click="addNewAssociation(character.index)"
            style="white-space: pre-wrap"
            >{{ character.value }}{{spaced_by}}</span
          ></span
        >
        <span
          v-else
          class="text-green-500 font-extrabold"
          style="white-space: pre-wrap"
          @click="removeThisAssociation(character.index)"
          >{{ character.value }}{{spaced_by}}</span
        >
      </span>
    </div>
    <br /><br />

    <!-- quick and dirty way to undo tags you haven't saved to the database yet -->
    <button @click="clearTimestamps()">CLICK ME to clear new timestamps</button
    ><br />
    <!-- quick and dirty way to purge the database of all tags for this interpretation, mainly used for debugging purposes -->
    <button @click="clearOldTimestamps()">
      CLICK ME to clear old timestamps
    </button>
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
      language_name: "",
      title: "",
      latest_text: "",
      latest_text_character_array: [],
      new_associations: {},
      spaced_by: "",
    };
  },

  props: {
    audio_id: {
      default: "",
    },
    interpretation_id: { default: "" },

    interpretationStatus: { default: "" },
  },

  mounted() {
    // get the text
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
        this.spaced_by = data.interpretation.spaced_by;
      })
      // convert the text into an array of single characters or words
      .then(() => {
        let character_array = this.latest_text.split(this.spaced_by);
        for (let i = 0; i < character_array.length; i++) {
          let sample_object = {};
          sample_object.index = i;
          sample_object.value = character_array[i];
          sample_object.newtag = false;
          this.latest_text_character_array.push(sample_object);
        }
      })
      .catch((error) => console.error("Error:", error));
  },
  methods: {
    clearTimestamps() {
      this.new_associations = {};
      // console.log(JSON.stringify(this.new_associations));
      for (let k = 0; k < this.latest_text_character_array.length; k++) {
        this.latest_text_character_array[k].newtag = false;
      }
    },

    clearOldTimestamps() {
      for (let k = 0; k < this.latest_text_character_array.length; k++) {
        this.addNewNullAssociation(k);
      }

      this.updateAssociations();
    },

    // if you click on a character that you have tagged in this session, it untags it
    removeThisAssociation(characterindex) {
      this.latest_text_character_array[characterindex].newtag = false;
      delete this.new_associations[characterindex];
      // console.log(JSON.stringify(this.new_associations));
    },

    // if you click on a character, it gives it a new tag
    addNewAssociation(characterindex) {
      let clicktime = this.$store.state.audioplayertime;
      this.latest_text_character_array[characterindex].newtag = true;
      this.new_associations[characterindex] = Math.round(clicktime);
      // console.log(JSON.stringify(this.new_associations));
    },

    addNewNullAssociation(characterindex) {
      this.new_associations[characterindex] = null;
    },

    updateAssociations() {
      // console.log(
      //   JSON.stringify({
      //     text: this.latest_text, // Pass in a string that meets a minimum character count and includes all the new tags you want to save
      //     associations: this.new_associations, // Pass in the list of the new tags
      //   })
      // );

      // send new tags to the database
      fetch(
        process.env.VUE_APP_api_URL +
          "content/" +
          this.audio_id +
          "/" +
          this.interpretation_id,
        {
          method: "POST",
          body: JSON.stringify({
            text: this.latest_text, // Pass in a string that meets a minimum character count and includes all the new tags you want to save
            associations: this.new_associations, // Pass in the list of the new tags
          }),

          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
        }
      )
        .then((response) => response)
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));
    },
  },
};
</script>
