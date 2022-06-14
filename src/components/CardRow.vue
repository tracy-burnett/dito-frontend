<template>
  <div
    class="
      cardrow
      bg-white
      overflow-hidden
      rounded-xl
      relative
      border
      mr-7
      transition-colors
    "
  >
    <!-- <img class="h-1/2 w-full" :src="image" alt="Sunset in the mountains" /> -->
    <div class="grid grid-cols-8 ml-20 px-4 py-2 items-center">
      <div v-if="!archived">
        <button
          class="
            bg-indigo-500
            border border-indigo-400
            w-1/2
            text-sm
            px-3
            py-2
            rounded
            font-medium
            text-white
            hover:bg-indigo-400
            transition-colors
          "
          @click="openstorybook()"
        >
          View
        </button>
      </div>
      <div v-else></div>
      <div v-if="!archived">
        <textarea
          class="font-bold border-gray-300 rounded"
          rows="3"
          style="overflow: hidden"
          v-model="title"
          @focusout="savechanges()"
        ></textarea></div>   
      <div v-else>
        <p class="font-bold">{{ title }}</p>
      </div>   <div v-if="!archived">
        <textarea
          class="border-gray-300 rounded"
          rows="3"
          style="overflow: hidden"
          v-model="description"
          @focusout="savechanges()"
        ></textarea>
      </div>
      <div v-else>
        <p>{{ description }}</p>
      </div>
      <p>{{ uploader }}</p>
      <p>{{ date }}</p>
      <p>{{ last_edited }}</p>
      <span v-if="!archived && status=='owner'">
        <input
          type="checkbox"
          id="publictf"
          value="publictf"
          v-model="publictf"
          @change="savechanges()"
        />
        <span v-if="publictf"> yes</span>
        <span v-else> no</span>
      </span>
      <span v-else></span>
      <!-- <p class="">
        {{ publictf }}
      </p> -->
      <div>
        <div v-if="!archived && status=='owner'">
          <!-- <button
            class="
              bg-indigo-500
              border border-indigo-400
              w-2/3
              text-sm
              px-3
              py-2
              rounded
              font-medium
              text-white
              hover:bg-indigo-400
              transition-colors
            "
            @click="savechanges()"
          >
            Save Edits</button
          ><br> -->
          <button
            class="
              bg-indigo-500
              border border-indigo-400
              w-2/3
              text-sm
              px-3
              py-2
              rounded
              font-medium
              text-white
              hover:bg-indigo-400
              transition-colors
            "
            @click="archive()"
          >
            Archive
          </button>
        </div>
        <div v-else>
          <button
            class="
              bg-indigo-500
              border border-indigo-400
              w-1/2
              text-sm
              px-3
              py-2
              rounded
              font-medium
              text-white
              hover:bg-indigo-400
              transition-colors
            "
            @click="unarchive()"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
    <!-- <div
      class="
        flex
        justify-center
        items-center
        bg-sky-700
        absolute
        h-14
        w-14
        rounded-full
        play
        shadow-lg
        mr-4
      "
    >
      <img class="text-white h-8 w-8 ml-1" src="@/assets/play.svg" />
    </div> -->
  </div>
</template>

<script>
export default {
  name: "CardRow",

  props: {
    title: {
      default: "",
    },

    description: {
      default: "",
    },

    last_edited: { default: "" },

    image: {
      default:
        "https://news.cgtn.com/news/7951544e3141444e3241444f324d444e3041444f31457a6333566d54/img/9e5aaea84367492ba672cb918e8bf62e/9e5aaea84367492ba672cb918e8bf62e.jpg",
    },

    publictf: {
      default: "",
    },

    uploader: {
      default: "",
    },

    archived: {
      default: false,
    },

    date: {
      default: "",
    },

    status: { default: "" },

    audio_ID: {
      default: "",
    },
  },

  mounted() {},

  methods: {
    openstorybook() {
      this.$router.push({
        name: "Storybook",
        params: { audio_ID: this.audio_ID },
      });
    },

    unarchive() {
      fetch(
        process.env.VUE_APP_api_URL +
          "audio/" +
          this.audio_ID +
          "/" +
          this.status +
          "/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
          body: JSON.stringify({
            // url: "coverimage.jpg",
            // title: this.title,
            // description: this.description,
            // public: this.publictf,
            archived: false,
            // shared_with: [],
          }),
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          this.$store.commit("forceDashboardRerender");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    archive() {
      fetch(
        process.env.VUE_APP_api_URL +
          "audio/" +
          this.audio_ID +
          "/" +
          this.status +
          "/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
          body: JSON.stringify({
            // url: "coverimage.jpg",
            // title: this.title,
            // description: this.description,
            public: false,
            archived: true,
            // shared_with: [],
          }),
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          this.$store.commit("forceDashboardRerender");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    savechanges() {
      fetch(
        process.env.VUE_APP_api_URL +
          "audio/" +
          this.audio_ID +
          "/" +
          this.status +
          "/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            Authorization: this.$store.state.idToken,
          },
          body: JSON.stringify({
            // url: "coverimage.jpg",
            title: this.title,
            description: this.description,
            public: this.publictf,
            // shared_with: [],
          }),
        }
      )
        .then((response) => {
          return response.json();
        })

        .then((response) => {
          this.$store.commit("forceDashboardRerender");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
};
</script>

<style scoped>
.cardrow {
  width: 100%;
}

/* .play {
  top: calc(50% - 1.75rem);
  right: 0;
} */
</style>