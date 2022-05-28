<template>
  <div>
    <div id="create" @click="create">
      <div class="h-10 w-10">
        <img src="@/assets/menu-bars.svg" />
      </div>
      </div>
    <div id="add" @click="add">
      <div class="h-10 w-10">
        <img src="@/assets/playAudio.svg" />
      </div>
    </div><br>
        <!-- <button id="add" @click="subtract">
      <div class="h-10 w-10">
        <img src="@/assets/pauseAudio.svg" />
      </div>
    </button> -->
  </div>
</template>

<script>
export default {
  name: "AddInterpretationViewer",
  data: () => {
    return {
    };
  },
  mounted() {},
  props: {    audio_id: {
      default: "",
    },
    interpretationsList: {
      default: [],
    },},
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
                      console.log(response.interpretation);
                      this.$emit("addCreatedInterpretation", response.interpretation) // pull this out of the response
                            this.$store.commit("addConsolesCount", response.interpretation.id); // pull this out of the response
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });

    },
    add() {
        let newID=this.interpretationsList[0].id
            this.$emit("changeInterpretationID", newID);
    //   this.$store.commit("addConsolesCount", newID); // pull this out of the next available
    },
    //     subtract() {
    //   this.$store.commit("subtractConsolesCount");
    // },
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

