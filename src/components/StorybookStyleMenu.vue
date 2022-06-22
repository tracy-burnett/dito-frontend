<template>
  <div>
    <div class="dropdown" style="float: right">
      <button class="dropbtn bg-indigo-700">Interaction</button>
      <div class="dropdown-content">
        <a @click="toggleStorybookStyle('Viewer')">Viewing</a>
        
        <a v-if="interpretationStatus == 'owner' || interpretationStatus == 'editor'" @click="toggleStorybookStyle('Editor')">Editing</a>
        <a v-if="interpretationStatus == 'owner' || interpretationStatus == 'editor'" @click="toggleStorybookStyle('Tagger')">Tagging</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StorybookStyleMenu",
  data: () => {
    return {};
  },
  props: {
    interpretationStatus: {
      default: "viewer",
    },},
  methods: {
    toggleStorybookStyle(styleselection) {
      // tell the parent component to load Viewer, Editor, or Tagger, corresponding with what the user has selected in this dropdown menu
      this.$emit("toggleStorybookStyle", styleselection);
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

