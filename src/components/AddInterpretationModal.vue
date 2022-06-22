<template>
  <div
    class="
      backdrop
      flex-auto flex-1 flex-col
      h-full
      overflow-hidden
      flex
      justify-center
      items-center
      mt-10
    "
    @click.self="closeModal()"
  >
    <div
      class="
        flex flex-col
        items-center
        border border-gray-300
        bg-white
        shadow-md
        rounded-xl
        p-8
        xl:w-2/5
        lg:w-2/4
        md:w-2/3
      "
    >
    <button
        class="text-xl text-gray-500 my-2 mx-4"
        @click.prevent="closeModal()"
      >
        ×
      </button>
      <h1 class="text-2xl font-bold">Start New Interpretation</h1>
      <br />
      <input
        class="border border-gray-300 rounded w-full px-3 py-1"
        placeholder="Title of New Interpretation"
        v-model="int_title"
      />
            <input
        class="border border-gray-300 rounded w-full px-3 py-1"
        placeholder="Language of New Interpretation"
        v-model="int_language"
      />
      <input
        class="border border-gray-300 rounded w-full px-3 py-1"
        placeholder="What character is this language 'spaced' by? (or leave blank)"
        v-model="int_spacing"
        maxlength="1"
      />
      <textarea
        class="
        form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
      "
        placeholder="Text of New Interpretation"
        v-model="int_text"
        rows="5"
        style="overflow-y: scroll"
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
        @click="create"
      >
        Create Interpretation
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AddInterpretationModal",
  components: {},
  data() {
    return {
      int_title: "",
      int_text: "",
      int_language: "",
      int_spacing: "",
    };
  },
  props: {
    audio_id: {
      default: "",
    },
  },
  methods: {
    create() {
      fetch(
        process.env.VUE_APP_api_URL +
          "interpretations/audio/" +
          this.audio_id +
          "/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
          body: JSON.stringify({
            title: this.int_title.normalize('NFC'),
            latest_text: this.int_text.normalize('NFC'),
            language_name: this.int_language.normalize('NFC'),
            spaced_by: this.int_spacing.normalize('NFC'),
            public: false,
          }),
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          // console.log(response.interpretation);
          // if the interpretation was created successfully, then tell the parent component to add it to the list of interpretations potentially displayed in the dropdown menu, and tell the Vuex store that we need to add another column to the main screen for viewing the new interpretation
          this.$emit("addCreatedInterpretation", response.interpretation);
          this.$emit("closeInterpretationModal");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    closeModal() {
      this.$emit("closeInterpretationModal");
    },
  },
};
</script>

<style scoped>
.backdrop {
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  width: 100%;
  height: 100%;
}
</style>