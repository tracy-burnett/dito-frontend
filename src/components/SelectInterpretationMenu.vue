<template>
  <div>
    <div class="dropdown" style="float: right">
      <button class="dropbtn">Select Interpretation</button>

      <div class="dropdown-content">
        <span
          v-for="interpretation in interpretationsList"
          :key="interpretation.id"
        >
          <a @click="selectInterpretationMenu(interpretation.id, interpretation.created_by, interpretation.shared_editors, interpretation.shared_viewers)">{{
            interpretation.language_name
          }}</a>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelectInterpretationMenu",
  data: () => {
    return {
      interpretationsList: [],
    };
  },
  mounted() {
    //fetch the interpretations I have access to for this audio
    const apiUrl =
      process.env.VUE_APP_api_URL +
      "interpretations/audio/" +
      this.audio_id +
      "/";
    fetch(apiUrl, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",

        Authorization: this.$store.state.idToken,
      },
    })
      .then((response) => response.json())
      .then((data) => (this.interpretationsList = data["interpretations"]))
      .catch((error) => console.error("Error:", error));
  },
  props: {
    audio_id: {
      default: 0,
    },
  },
  methods: {
    selectInterpretationMenu(interpretationselection, owner, editors, viewers) {
      this.$store.commit("selectInterpretationMenu", interpretationselection);

        if (owner == this.$store.state.user.uid) {
            this.$store.commit("setInterpretationStatus", "owner")
        }
            else if (editors.includes(this.$store.state.user.uid)) {            this.$store.commit("setInterpretationStatus", "editor")}
            else if (viewers.includes(this.$store.state.user.uid)) {            this.$store.commit("setInterpretationStatus", "viewer")}
            console.log(this.$store.state.interpretationchoice)
            console.log(this.$store.state.interpretationStatus)
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

