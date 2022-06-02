<template>
  <div class="">
    <SidebarAlt />
    <div class="flex flex-col">
      <Navbar />
    </div>
    <div class="flex items-top">
      <span
        v-if="showAddInterpretationModal"
        class="fixed inset-0 w-full h-screen flex items-center justify-center"
        ><AddInterpretationModal
          :audio_id="audio_ID"
          @addCreatedInterpretation="addCreatedInterpretation($event)"
          @closeInterpretationModal="closeInterpretationModal()"
      /></span>
      <PlayerVertical
        :key="playerKey"
        :audio_ID="audio_ID"
        @rerenderPlayer="playerKey++"
      />

      <!-- given the Vuex store's list of interpretation ID's that the user wants displayed in columns in the browser window, create a column for each one -->
      <span
        v-for="interpretation in $store.state.consoles"
        :key="interpretation"
      >
        <!-- tell the column which audio ID we are working with, which interpretations to put in the dropdown menu for viewing, which interpretations are currently being viewed (formerInterpretationsList),
      and the id of the interpretation to be displayed in this column in the browser window.  The SingleInterpretation component can use events
      to tell this Storybook component to delete this interpretation column and add a new one for a different interpretation ID. -->
        <SingleInterpretation
          :audio_id="audio_ID"
          :interpretationsList="interpretationsList"
          :formerInterpretationsList="formerInterpretationsList"
          :interpretation_id="interpretation"
          @returnFormerInterpretation="returnFormerInterpretation($event)"
          @displayInterpretationID="displayInterpretationID($event)"
      /></span>
      <!-- the AddInterpretationViewer component can tell this Storybook component to add a new column for an interpretation that it just created (addCreatedInterpretation),
      or to add a new column for an interpretation that has previously been created (displayInterpretationID). -->

      <AddInterpretationViewer
        :audio_id="audio_ID"
        :interpretationsList="interpretationsList"
        @toggleInterpretationModal="toggleInterpretationModal()"
        @displayInterpretationID="displayInterpretationID($event)"
      />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";
import SingleInterpretation from "@/components/SingleInterpretation.vue";
import AddInterpretationViewer from "@/components/AddInterpretationViewer.vue";
import AddInterpretationModal from "@/components/AddInterpretationModal.vue";

export default {
  name: "Storybook",
  components: {
    Navbar,
    PlayerVertical,
    SidebarAlt,
    SingleInterpretation,
    AddInterpretationViewer,
    AddInterpretationModal,
  },
  data: () => {
    return {
      playerKey: 0, // helper; when it changes, reload Player Vertical
      interpretationsList: [], // the list of interpretations that can be selected from the dropdown menu (does not include interpretations currently being viewed by this user in this browser window)
      formerInterpretationsList: [], // the list of interpretations currently being viewed by this user in this browser window
      showAddInterpretationModal: false,
    };
  },
  props: {
    audio_ID: "",
  },
  computed: {},

  mounted() {
    this.formerInterpretationsList.forEach(formerinterpretation =>
    this.returnFormerInterpretation(formerinterpretation))
    //fetch the interpretations the logged-in user has access to for this audio file
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
        this.interpretationsList = data["interpretations"];
        this.displayInterpretationID(this.interpretationsList[0].id)
      })
      .catch((error) => console.error("Error:", error));
  },

  methods: {
    // move an interpretation from a column in the browser window to the dropdown menu
    returnFormerInterpretation(oldInterpretation) {
      // make an array of the ID's of interpretations currently being viewed
      let mappedoldIDsArray = this.formerInterpretationsList.map(
        (item) => item.id
      );

      // find the index # of the ID to be returned to the dropdown menu (and removed from the viewer)
      let indexofold = mappedoldIDsArray.indexOf(oldInterpretation);
      if (indexofold > -1) {
        // if the index # is successfully identified, then add the whole interpretation object to the list of interpretations for the dropdown menu...
        this.interpretationsList.unshift(
          this.formerInterpretationsList[indexofold]
        );
        // ... and remove it from the list of interpretations currently being viewed
        this.formerInterpretationsList.splice(indexofold, 1); // 2nd parameter means remove one item only
      }

      // tell the Vuex store to remove the ID number of the interpretation in question from the list of interpretions that currently need columns in the browser window
      this.$store.commit("deleteConsole", oldInterpretation);
    },

    displayInterpretationID(newID) {
      // make an array of the ID's of interpretations currently in the Dropdown menu
      let mappedIDsArray = this.interpretationsList.map((item) => item.id);

      // find the index # of the interpretation ID that we want to add into a column in the browser window (and removed from the Dropdown menu)
      let index = mappedIDsArray.indexOf(newID);
      if (index > -1) {
        // if the index # is successfully identified, then add the whole interpretation object to the list of interpretations for the browser window...

        this.formerInterpretationsList.push(this.interpretationsList[index]);
        // ... and remove it from the list of interpretations currently in the Dropdown menu
        this.interpretationsList.splice(index, 1); // 2nd parameter means remove one item only
      }

      // tell the Vuex store to add the ID number of the interpretation in question to the list of interpretions that currently need columns in the browser window
      this.$store.commit("addConsolesCount", newID);
    },

    // add a whole interpretation object (which was emitted by the child component that just created it and also created a new column for it) to the list of interpretations that are being viewed in the browser window
    addCreatedInterpretation(interpretation) {
      this.formerInterpretationsList.push(interpretation);
    },
    toggleInterpretationModal() {
      this.showAddInterpretationModal = !this.showAddInterpretationModal;
    },
    closeInterpretationModal() {
      this.showAddInterpretationModal = false;
    },
  },
};
</script>

<style scoped>
</style>
