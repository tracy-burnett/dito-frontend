<template>
  <div class="lg:ml-16 mx-5 w-full">
    <h1 class="font-bold text-2xl mt-8 mb-6">Active Storybooks</h1>
    <div class="flex justify-around w-full">
      <span>
        <input
          type="checkbox"
          id="owner"
          value="owner"
          v-model="checkedFilters"
        />
        <label for="owner"> owner</label></span
      >

      <span>
        <input
          type="checkbox"
          id="editor"
          value="editor"
          v-model="checkedFilters"
        />
        <label for="editor"> editor</label></span
      >

      <span>
        <input
          type="checkbox"
          id="viewer"
          value="viewer"
          v-model="checkedFilters"
        />
        <label for="viewer"> viewer</label></span
      >

      <span>
        <input
          type="checkbox"
          id="public"
          value="public"
          v-model="checkedFilters"
        />
        <label for="public"> public</label></span
      >
      <!-- {{audioArray}} -->

      <span>
        <input
          type="checkbox"
          id="archived"
          value="archived"
          v-model="checkedFilters"
        />
        <label for="archived"> archived</label></span
      >
      <!-- {{audioArray}} --><br /><br />
    </div>
    <div class="">
      <div class="grid grid-cols-8 px-4 py-2 ml-20">
        <p></p>
        <p class="font-bold">Title</p>
        <p class="">Description</p>
        <p class="">created by</p>
        <p>created at</p>
        <p>last edited at</p>
        <p>Public?</p>
        <p></p>
      </div>
      <!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->
      <span v-if="checkedFilters.includes('owner')">
        <span v-for="audio in audioArrayOwner" :key="audio.ID">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            :publictf="audio.public"
            status="owner"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          />
        </span>
      </span>
      <span v-if="checkedFilters.includes('editor')">
        <div v-for="audio in audioArrayEditor" :key="audio.ID">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            status="editor"
            :publictf="audio.public"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          />
        </div>
      </span>
      <span v-if="checkedFilters.includes('viewer')">
        <div v-for="audio in audioArrayViewer" :key="audio.ID">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :uploader="audio.uploaded_by.display_name"
            :description="audio.description"
            :publictf="audio.public"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          />
        </div>
      </span>
      <span v-if="checkedFilters.includes('public')">
        <div v-for="audio in audioArrayPublic" :key="audio.ID">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            :publictf="audio.public"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          /></div></span
      ><br /><br />

    <h1 class="font-bold text-2xl mt-8 mb-6">Archived Storybooks</h1>
      <br />
      <div class="grid grid-cols-8 px-4 py-2 ml-20">
        <p></p>
        <p class="font-bold">Title</p>
        <p class="">Description</p>
        <p class="">created by</p>
        <p>created at</p>
        <p>last edited at</p>
        <p>Public?</p>
        <p></p>
      </div>
      <span v-if="checkedFilters.includes('archived')">
        <div v-for="audio in audioArrayArchive" :key="audio.ID">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            :publictf="audio.public"
            status="owner"
            :archived="audio.archived"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          /></div
      ></span>
    </div>
  </div>
</template>

<script>
import CardRow from "@/components/CardRow.vue";

export default {
  data() {
    return {
      audioArray: [],
      audioArrayOwner: [], // the list of audio files owned by the logged-in user
      audioArrayEditor: [],
      audioArrayViewer: [],
      audioArrayPublic: [],
      audioArrayArchive: [],
      checkedFilters: ["owner", "editor", "viewer", "public", "archived"],
    };
  },
  name: "CardList",
  watch: {
    "$store.state.idToken": function () {
      this.getStorybooks();
    },
  },
  components: {
    CardRow,
  },
  mounted() {
    if (this.$store.state.idToken) {
      this.getStorybooks();
    }
  },
  methods: {
    getStorybooks() {
      fetch(process.env.VUE_APP_api_URL + "audio/user/", {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          Authorization: this.$store.state.idToken,
        },
      })
        .then((response) => response.json()) // json to object
        .then(
          (data) => {
            this.audioArray = data["audio files"];
          } // collect the list of audio files that are owned by, or shared with, the logged-in user
        )
        .then((data) => {
          this.audioArray.forEach((element) => {
            // console.log(element.uploaded_by.shared_editors)
            if (
              element.uploaded_by.user_ID == this.$store.state.user.uid &&
              !element.archived
            ) {
              // console.log("1")
              this.audioArrayOwner.push(element);
            } else if (
              element.shared_editors.includes(this.$store.state.user.uid)
            ) {
              // console.log("2")
              this.audioArrayEditor.push(element);
            } else if (
              element.shared_viewers.includes(this.$store.state.user.uid)
            ) {
              // console.log("3")
              this.audioArrayViewer.push(element);
            } else if (element.public) {
              // console.log("4")
              this.audioArrayPublic.push(element);
            } else if (
              element.archived &&
              element.uploaded_by.user_ID == this.$store.state.user.uid
            ) {
              this.audioArrayArchive.push(element);
            }
          });
        })
        .catch((error) => console.error("Error:", error));
    },
  },
};
</script>

<style scoped>
.flex {
  flex-wrap: wrap;
}
</style>