<template>
  <div class="">
    <SidebarAlt />
    <div class="flex flex-col">
      <Navbar />
    </div>
    <div class="flex items-top">
      <PlayerVertical :audio_ID="audio_ID" />

      <span v-for="interpretation in $store.state.consoles" :key="interpretation">
        <SingleInterpretation
          :audio_id="audio_ID"
          :interpretationsList="interpretationsList"
          :formerInterpretationsList="formerInterpretationsList"
          :interpretation_id="interpretation"
          @returnFormerInterpretation="returnFormerInterpretation($event)"
          @changeInterpretationID="changeInterpretationID($event)"
      /></span>
      <AddInterpretationViewer :audio_id="audio_ID" :interpretationsList="interpretationsList" @addCreatedInterpretation="addCreatedInterpretation($event)" @changeInterpretationID="changeInterpretationID($event)"/>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";
import SingleInterpretation from "@/components/SingleInterpretation.vue";
import AddInterpretationViewer from "@/components/AddInterpretationViewer.vue";

export default {
  name: "Storybook",
  data: () => {
    return {
      interpretationsList: [],
      formerInterpretationsList: [],
    };
  },
  computed: {
    //We're not defining it here; we're using a computed property to reach out and get it.
  },
  props: {
    audio_ID: "",
  },

  methods: {
    returnFormerInterpretation(oldInterpretation) {
      let mappedoldIDsArray = this.formerInterpretationsList.map(
        (item) => item.id
      );
      // console.log("mapped old ids array " + mappedoldIDsArray);
      // console.log("int to add back into main array " + oldInterpretation);
      let indexofold = mappedoldIDsArray.indexOf(oldInterpretation);
      // console.log(indexofold);
      if (indexofold > -1) {
        // console.log("inside the if statement");
        this.interpretationsList.unshift(
          this.formerInterpretationsList[indexofold]
        );
        this.formerInterpretationsList.splice(indexofold, 1); // 2nd parameter means remove one item only
      }

      // console.log(
      //   "timeout array " + JSON.stringify(this.formerInterpretationsList)
      // );
      // console.log(
      //   "still available array" + JSON.stringify(this.interpretationsList)
      // );
      
                            this.$store.commit("deleteConsole", oldInterpretation); 
    },

    changeInterpretationID(newID) {
      // console.log("list " + JSON.stringify(this.interpretationsList));

      // console.log("new int id " + newID);
      let mappedIDsArray = this.interpretationsList.map((item) => item.id);
      // console.log("map array " + mappedIDsArray);
      let index = mappedIDsArray.indexOf(newID);
      // console.log("index" + index);

      if (index > -1) {
        this.formerInterpretationsList.push(this.interpretationsList[index]);
        this.interpretationsList.splice(index, 1); // 2nd parameter means remove one item only
      }
                            this.$store.commit("addConsolesCount", newID); 
      
    },

        addCreatedInterpretation(interpretation) {
      // console.log("list " + JSON.stringify(this.interpretationsList));

      // console.log("new int id " + newID);
      // let mappedIDsArray = this.interpretationsList.map((item) => item.id);
      // console.log("map array " + mappedIDsArray);
      // let index = mappedIDsArray.indexOf(newID);
      // console.log("index" + index);

      // if (index > -1) {
        this.formerInterpretationsList.push(interpretation);
        // this.interpretationsList.splice(index, 1); // 2nd parameter means remove one item only
      // }
    },
  },

  mounted() {
    //fetch the interpretations I have access to for this audio
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
      })
      .catch((error) => console.error("Error:", error));
  },
  components: {
    Navbar,
    PlayerVertical,
    SidebarAlt,
    SingleInterpretation,
    AddInterpretationViewer,
  },
};
</script>

<style scoped>
</style>
