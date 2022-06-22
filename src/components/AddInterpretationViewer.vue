<template>
  <div>
    <!-- this is a button for creating a new Interpretation and having it displayed in its own column -->
    <div  class="sticky top-16" id="create" @click="show" style="cursor:pointer">
      <div class="h-10 w-10">
        <img src="@/assets/add-new.svg" />
      </div> Create New Interpretation
    </div>
    <!-- this is a button for adding another column that shows an Interpretation that you have access to but aren't yet viewing -->
    <div  class="sticky top-40" v-show="this.interpretationsList[0]" id="add" @click="add" style="cursor:pointer">
      <div class="h-10 w-10">
        <img src="@/assets/add-existing.svg" />
      </div> Add Another Console
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
    interpretationsList: {
      // the list of interpretations that can be added as new columns. this does not include interpretations that are already being viewed.
      default: [],
    },
  },
  mounted() {},
  methods: {
    show() {
      this.$emit("toggleInterpretationModal");
    },
    add() {
      if (this.interpretationsList[0]) {
      let newID = this.interpretationsList[0].id; // prepare to display whichever interpretation was listed FIRST in the dropdown menu in a viewer
      this.$emit("displayInterpretationID", newID); // tell the parent component that the interpretation with that ID is now displayed in a viewer, and should no longer be available in the dropdown menu
      }
      else {this.show()}
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

