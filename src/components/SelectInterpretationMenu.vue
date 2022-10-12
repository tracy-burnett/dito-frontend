<template>
  <div>
    <div class="dropdown" style="float: right">
      <button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600">Interpretation</button>

      <div class="dropdown-content">
        <!-- for each interpretation in the list of interpretations to show in the Dropdownmenu, create a menu option that displays the language name -->
        <span
          v-for="interpretation in interpretationsList"
          :key="interpretation.id"
        >
          <a @click="selectInterpretationMenu(interpretation.id)">{{interpretation.title}}, in {{
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
    return {}
  },
  props: {

    // the list of interpretations available to be selected in the Dropdown menu (does not include the interpretations currently being viewed)
    interpretationsList: {
      default: [],
    },
  },

  methods: {
    // tell the parent component that we are swapping the interpretation currently in the viewer with the one the User just selected from the Dropdown menu
    selectInterpretationMenu(interpretationselection) {
      this.$emit("changeInterpretationID", interpretationselection);
    },
  },
};
</script>

<style scoped>
.dropbtn {
  /* background-color: #7833ff; */
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
  /* background-color: #7833ff; */
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
/* .dropdown:hover .dropbtn { */
  /* background-color: #7833ff; */
/* } */
</style>

