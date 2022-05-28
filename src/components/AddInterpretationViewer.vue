<template>
  <div>
    <!-- this is a button for creating a new Interpretation and having it displayed in its own column -->
    <div id="create" @click="create">
      <div class="h-10 w-10">
        <img src="@/assets/menu-bars.svg" />
        <!-- change this icon to something more appropriate -->
      </div>
    </div>
    <!-- this is a button for adding another column that shows an Interpretation that you have access to but aren't yet viewing -->
    <div id="add" @click="add">
      <div class="h-10 w-10">
        <img src="@/assets/playAudio.svg" />
        <!-- change this icon to something more appropriate -->
      </div>
    </div>
    <br />
  </div>
</template>

<script>
export default {
  name: "AddInterpretationViewer",
  data: () => {
    return {};
  },
  props: {
    audio_id: {
      default: "",
    },
    interpretationsList: {
      // the list of interpretations that can be added as new columns. this does not include interpretations that are already being viewed.
      default: [],
    },
  },
  mounted() {},
  methods: {
    // creates a new interpretation, with hardcoded defaults for now
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
            user: "skysnolimit08",
            title: "testtitle",
            latest_text: "beealkjvlakwejflai ihgoaiehfoajiewf",
            language_name: "Unknown Dialect",
            spaced_by: null,
            public: false,
          }),
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          // if the interpretation was created successfully, then tell the parent component to add it to the list of interpretations potentially displayed in the dropdown menu, and tell the Vuex store that we need to add another column to the main screen for viewing the new interpretation
          this.$emit("addCreatedInterpretation", response.interpretation);
          this.$store.commit("addConsolesCount", response.interpretation.id);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
    add() {
      let newID = this.interpretationsList[0].id; // prepare to display whichever interpretation was listed FIRST in the dropdown menu in a viewer
      this.$emit("displayInterpretationID", newID); // tell the parent component that the interpretation with that ID is now displayed in a viewer, and should no longer be available in the dropdown menu
    },
  },
};
</script>

<style>
.dropbtn {
  background-color: #7833ff;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.buttonplus {
  background-color: #7833ff;
  border: none;
  color: white;
  padding: 9px 12px;
  position: fixed;
  left: 600px;
  top: 300px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
}

.buttonplus {
  border-radius: 100%;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}
.dropdown:hover .dropdown-content {
  display: block;
}
.dropdown:hover .dropbtn {
  background-color: #7833ff;
}
</style>

