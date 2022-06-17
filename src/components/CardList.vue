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
          @change="getStorybooks()"

        />
        <label for="owner"> owner</label></span
      >

      <span>
        <input
          type="checkbox"
          id="editor"
          value="editor"
          v-model="checkedFilters"
          @change="getStorybooks()"
        />
        <label for="editor"> editor</label></span
      >

      <span>
        <input
          type="checkbox"
          id="viewer"
          value="viewer"
          v-model="checkedFilters"
          @change="getStorybooks()"
        />
        <label for="viewer"> viewer</label></span
      >

      <span>
        <input
          type="checkbox"
          id="public"
          value="public"
          v-model="checkedFilters"
          @change="getStorybooks()"
        />
        <label for="public"> other</label></span
      >
      <!-- {{audioArray}} -->

      <span>
        <input
          type="checkbox"
          id="archived"
          value="archived"
          v-model="checkedFilters"
          @change="getStorybooks()"
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
        <!-- <p>created at</p> -->
        <p>last edited at</p>
        <p>Public?</p>
        <p>Access</p>
        <p></p>
      </div>
      <!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->
      <span v-if="checkedFilters.includes('owner')">
        <span v-for="audio in audioArrayOwner" :key="audio.id">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            :publictf="audio.public"
            :shared_editors="audio.shared_editors"
            :shared_viewers="audio.shared_viewers"
            :picked="selected"
            :archived="audio.archived"
            status="owner"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          >        <input type="radio" :id = "audio.id" :value="audio.id" v-model="selected" @click="uncheck(audio.id)" />
        <label :for="audio.id" > more options</label></CardRow>
        </span>
      </span>
      <span v-if="checkedFilters.includes('editor')">
        <div v-for="audio in audioArrayEditor" :key="audio.id">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            status="editor"
            :picked="selected"
            :shared_viewers="audio.shared_viewers"
            :publictf="audio.public"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          >
        <input type="radio" :id = "audio.id" :value="audio.id" v-model="selected" @click="uncheck(audio.id)" />
        <label :for="audio.id" > more options</label></CardRow>
        </div>
      </span>
      <span v-if="checkedFilters.includes('viewer')">
        <div v-for="audio in audioArrayViewer" :key="audio.id">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :uploader="audio.uploaded_by.display_name"
            :description="audio.description"
            :publictf="audio.public"
            :picked="selected"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          >     <input type="radio" :id = "audio.id" :value="audio.id" v-model="selected" @click="uncheck(audio.id)" />
        <label :for="audio.id" > more options</label></CardRow>
        </div>
      </span>
      <span v-if="checkedFilters.includes('public')">
        <div v-for="audio in audioArrayPublic" :key="audio.id">
          <CardRow
            :date="audio.uploaded_at.substring(0, 10) + ' UTC'"
            :description="audio.description"
            :uploader="audio.uploaded_by.display_name"
            :picked="selected"
            :publictf="audio.public"
            :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
            :title="audio.title"
            :audio_ID="audio.id"
          >     <div><input type="radio" :id = "audio.id" :value="audio.id" v-model="selected" @click="uncheck(audio.id)" />
        <label :for="audio.id" > more options</label></div></CardRow></div></span
      ><br /><br />

<span v-if="(audioArrayArchive.length > 0) && (checkedFilters.includes('archived'))">
    <h1 class="font-bold text-2xl mt-8 mb-6">Archived Storybooks</h1>
      <br />
      <div class="grid grid-cols-8 px-4 py-2 ml-20">
        <p></p>
        <p class="font-bold">Title</p>
        <p class="">Description</p>
        <p class="">created by</p>
        <!-- <p>created at</p> -->
        <p>last edited at</p>
        <p></p>
        <p></p>
      </div></span>
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
computed: {
    selected: {
      // getter
      get() {
        return this.$store.state.selected // in the store
      },
set(selected) {          this.$store.commit(
      "updateSelected", selected
    );}
    }
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



    uncheck(id) {
      // console.log(id)
      // console.log("was " + this.previouslySelected)
      // console.log("now is " + this.selected)
      if (id == this.selected) {
        
      this.selected=false
    }
},


    getStorybooks() {
      this.audioArray = []
      this.audioArrayOwner = [], // the list of audio files owned by the logged-in user
      this.audioArrayEditor = [],
      this.audioArrayViewer = [],
      this.audioArrayPublic = [],
      this.audioArrayArchive = [],




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
            // console.log(this.audioArray)
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
            } else if (element.shared_editors.some(e => e.user_ID === this.$store.state.user.uid)
            ) {
              // console.log("2")
              this.audioArrayEditor.push(element);
            } else if (
              element.shared_viewers.some(e => e.user_ID === this.$store.state.user.uid)
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