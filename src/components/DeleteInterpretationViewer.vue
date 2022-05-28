<template>
  <div>
    <div id="destroy" @click="destroy">
      <div class="h-10 w-10">
        <img src="@/assets/pauseAudio.svg" />
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
  name: "DeleteInterpretationViewer",
  data: () => {
    return {
    };
  },
  mounted() {},
  props: {   
       interpretation_id: {
      default: "",
    },
    // interpretationsList: {
    //   default: [],
    // },
    },
  methods: {
    destroy() {
            this.$emit("returnFormerInterpretation", this.interpretation_id);
    //   this.$store.commit("deleteConsole", this.interpretation_id); // pull this out of the next available
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

