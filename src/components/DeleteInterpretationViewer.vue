<template>
  <div>
    <!-- clicking this button removes the interpretation column associated with it -->
    <div id="destroy">
      <div class="h-10 w-10" @click="destroy">
        <img src="@/assets/pauseAudio.svg" /> <!-- needs to be replaced with a more appropriate icon -->
      </div>
    </div>
    <br />
  </div>
</template>

<script>
export default {
  name: "DeleteInterpretationViewer",
  data: () => {
    return {};
  },
  mounted() {},
  props: {
    
    // id of the interpretation associated with this delete button
    interpretation_id: {
      default: "",
    },
  },
  methods: {
    destroy() {
      // tell the parent component to move this interpretation ID from a viewer column back to the dropdown menu of interpretations available to view
      this.$emit("returnFormerInterpretation", this.interpretation_id);
    },
  },
};
</script>

<style scoped>
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

