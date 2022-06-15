<template>
  <div>
            <span
      v-if="$store.state.showStorybookModal"
      class="fixed inset-0 w-full h-screen flex items-center justify-center z-10"
    >
      <StorybookModal
        :audio_id="audio_ID"
        :status="status"
        :shared_editors="shared_editors"
        :shared_viewers="shared_viewers"
        @updateCollaborators="updateCollaborators($event)"
      />
    </span>
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
      :class="{ editing: dropdown, notediting: !dropdown }"
    >
      <slot></slot>
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
        <div
          v-if="
            (!archived && dropdown && status == 'owner') || status == 'editor'
          "
        >
          <textarea
            class="font-bold border-gray-300 rounded w-full"
            rows="3"
            style="overflow: hidden"
            v-model="title"
            @focusout="savechanges()"
          ></textarea>
        </div>
        <div v-else>
          <p class="font-bold">{{ title }}</p>
        </div>
        <div
          v-if="
            (!archived && dropdown && status == 'owner') || status == 'editor'
          "
        >
          <textarea
            class="border-gray-300 rounded w-full"
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
        <!-- <p>{{ date }}</p> -->
        <p>{{ last_edited }}</p>
        <span v-if="!archived && status == 'owner'">
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
        
        <span v-else>
          <span v-if="publictf"> yes</span>
          <span v-else> no</span></span>
        <!-- <p class="">
        {{ publictf }}
      </p> -->
        <div>
          <div v-if="!archived && status == 'owner'">
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
          <div v-else-if="archived && status == 'owner'">
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
          <div v-else></div>
        </div>
          <p v-if="status == 'owner'"><button @click="showStorybookModal()">Manage Collaborators</button></p>
          <p v-else-if="status == 'editor'"><button>Invite Collaborators</button></p>
          <p v-else-if="status == 'viewer'"><button>Request to Collaborate</button></p>
      </div>
    </div>
    <div v-if="dropdown == true">
      <div
        v-for="interpretation in interpretationsList"
        :key="interpretation.id"
      >
        <IntManager :interpretation="interpretation" :audio_ID="audio_ID" />
      </div>
    </div>
  </div>
</template>

<script>
import IntManager from "@/components/IntManager.vue";
import StorybookModal from "@/components/StorybookModal.vue";

export default {
  name: "CardRow",
  components: { IntManager,
    StorybookModal, },
  watch: {
    dropdown: function () {
      this.getInterpretations();
    },
  },
  computed: {
    // the beginning of the highlighted region as manually typed in by the user, in seconds
    dropdown() {
      return this.audio_ID == this.picked;
    },
  },
  data: () => {
    return {
      interpretationsList: [],
    };
  },
  props: {
    title: {
      default: "",
    },

    picked: {
      default: "",
    },

    description: {
      default: "",
    },

        shared_editors: {
      default: {},
    },

    shared_viewers: {default: {}},

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

    showStorybookModal() {
      this.$store.commit("showStorybookModal");
    },
    getInterpretations() {
      const apiUrl =
        process.env.VUE_APP_api_URL +
        "interpretations/audio/" +
        this.audio_ID +
        "/";
      fetch(apiUrl, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          Authorization: this.$store.state.idToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log("data")
          // console.log(data["interpretations"])
          this.interpretationsList = data["interpretations"];
          // console.log(this.interpretationsList)
        })
        .catch((error) => console.error("Error:", error));
    },

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

        // .then((response) => {
        //   this.$store.commit("forceDashboardRerender");
        // })
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
/* .editing {

  background: rgba(0, 0, 0, 0.5);
} */
.notediting {
  background: white;
}

/* .play {
  top: calc(50% - 1.75rem);
  right: 0;
} */
</style>