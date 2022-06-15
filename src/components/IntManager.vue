<template>
  <div>
    <div
      class="relative overflow-hidden transition-colors bg-white border intmanagerrow rounded-xl mr-7"
    >
      <!-- <img class="w-full h-1/2" :src="image" alt="Sunset in the mountains" /> -->
      <div class="grid items-center grid-cols-8 px-4 py-2 ml-20">
          <p></p>
          <p class="font-bold">{{ interpretation.title }}</p>
        <p v-if="interpretation.spaced_by">{{ interpretation.language_name }} spaced by "{{interpretation.spaced_by}}"</p>
        <p v-else>{{ interpretation.language_name }}</p>
        <p>{{ interpretation.created_by.display_name }}</p>
        <p>{{ interpretation.last_edited_at.substring(0, 10) + ' UTC' }}</p>
        <span v-if="(interpretation.shared_editors.includes($store.state.user.uid)) || (interpretation.created_by.user_ID == $store.state.user.uid)">
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
        <p>
        {{ status }}
      </p>
      <p v-if="status == 'owner access'"><button>Add Editors</button></p>
      <p v-else-if="status == 'editor access'"><button>Add Viewers</button></p>
      <p v-else-if="status == 'viewer access' || status == 'public access'"><button>Request to Collaborate</button></p>
      </div>
    </div>
        </div>
</template>

<script>
export default {
  name: "IntManager",
  data: () => {
    return {publictf: false,
    status: ""};
  },
  props: {
    interpretation: {
      default: {},
    },
    audio_ID: {default: ""},
  },

  mounted() {this.publictf=this.interpretation.public

      if (this.interpretation.created_by.user_ID == this.$store.state.user.uid) {
        this.status = "owner access";
      } else if (this.interpretation.shared_editors.includes(this.$store.state.user.uid)) {
        this.status = "editor access";
      } else if (this.interpretation.shared_viewers.includes(this.$store.state.user.uid)) {
        this.status = "viewer access";
      } else if (this.publictf==true) {
        this.status = "public access";
      }


  },

  methods: {
    // openstorybook() {
    //   this.$router.push({
    //     name: "Storybook",
    //     params: { audio_ID: this.audio_ID },
    //   });
    // },
    // unarchive() {
    //   fetch(
    //     process.env.VUE_APP_api_URL +
    //       "audio/" +
    //       this.audio_ID +
    //       "/" +
    //       this.status +
    //       "/",
    //     {
    //       method: "PATCH",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: this.$store.state.idToken,
    //       },
    //       body: JSON.stringify({
    //         // url: "coverimage.jpg",
    //         // title: this.title,
    //         // description: this.description,
    //         // public: this.publictf,
    //         archived: false,
    //         // shared_with: [],
    //       }),
    //     }
    //   )
    //     .then((response) => {
    //       return response.json();
    //     })
    //     .then((response) => {
    //       this.$store.commit("forceDashboardRerender");
    //     })
    //     .catch((error) => {
    //       console.error("Error:", error);
    //     });
    // },
    // archive() {
    //   fetch(
    //     process.env.VUE_APP_api_URL +
    //       "audio/" +
    //       this.audio_ID +
    //       "/" +
    //       this.status +
    //       "/",
    //     {
    //       method: "PATCH",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: this.$store.state.idToken,
    //       },
    //       body: JSON.stringify({
    //         // url: "coverimage.jpg",
    //         // title: this.title,
    //         // description: this.description,
    //         public: false,
    //         archived: true,
    //         // shared_with: [],
    //       }),
    //     }
    //   )
    //     .then((response) => {
    //       return response.json();
    //     })
    //     .then((response) => {
    //       this.$store.commit("forceDashboardRerender");
    //     })
    //     .catch((error) => {
    //       console.error("Error:", error);
    //     });
    // },
    savechanges() {
      fetch(
        process.env.VUE_APP_api_URL +
          "interpretations/" +
          this.interpretation.id +
          "/audio/" +
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
.intmanagerrow {
  width: 100%;
  /* background: rgba(0, 0, 0, 0.5); */
}

/* .play {
  top: calc(50% - 1.75rem);
  right: 0;
} */
</style>