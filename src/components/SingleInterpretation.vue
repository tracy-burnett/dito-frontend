<template>
  <div>
    <!-- this SingleInterpretation component represents what is viewable in a single interpretation column of an open storybook -->
    <div>
      <!-- the StorybookStyleMenu component allows the user to choose whether they want to interact with the interpretation via the Viewer, Tagger, or Editor feature -->
      <!-- the user's selection is communicated back to this SingleInterpretation component via the toggleStorybookStyle event -->
      <StorybookStyleMenu
        @toggleStorybookStyle="toggleStorybookStylefunction($event)"
      />
      <!-- SelectInterpretationMenu allows the user to swap out the interpretation they are currently viewing for a different one -->
      <!-- this SingleInterpretation component tells the SelectInterpretationMenu component what interpretations to place in its Dropdown menu via interpretationsList -->
      <!-- the user's selection of a new interpretation is communicated back to this SingleInterpretation component via the changeInterpretationID event -->
      <SelectInterpretationMenu
        :interpretationsList="interpretationsList"
        @changeInterpretationID="changeInterpretationIDfunction($event)"
      />
    </div>
    <br /><br /><br /><br /><br />
    <div>
      <!-- this component will be Viewer, Tagger, or Editor, depending on the user's selection of "styleoption" via the StorybookStyleMenu -->
      <component
        v-bind:is="styleoption"
        :audio_id="audio_id"
        :interpretationStatus="interpretationStatus"
        :interpretation_id="interpretation_id"
      ></component>

      <!-- this component allows the user to remove the entire interpretation column from their browser window -->
      <DeleteInterpretationViewer
        :interpretation_id="interpretation_id"
        @returnFormerInterpretation="returnFormerInterpretation($event)"
      />
    </div>
  </div>
</template>

<script>
import Viewer from "@/components/Viewer.vue";
import Editor from "@/components/Editor.vue";
import Tagger from "@/components/Tagger.vue";
import StorybookStyleMenu from "@/components/StorybookStyleMenu.vue";
import SelectInterpretationMenu from "@/components/SelectInterpretationMenu.vue";
import DeleteInterpretationViewer from "@/components/DeleteInterpretationViewer.vue";

export default {
  name: "SingleInterpretation",
  components: {
    Editor,
    Viewer,
    Tagger,
    StorybookStyleMenu,
    SelectInterpretationMenu,
    DeleteInterpretationViewer,
  },

  data: () => {
    return {
      interpretationStatus: "", // this remembers whether the currently logged-in user is a viewer, editor, or owner of the currently-displayed interpretation
      styleoption: "Viewer", // this can be Viewer, Editor, or Tagger, depending on how the user is currently interacting with the displayed interpretation
      interpretationFull: {}, // this contains all of the information about the currently displayed interpretation
    };
  },

  props: {
    audio_id: {
      default: "",
    },
    interpretation_id: {
      default: "",
    },
    // list of interpretations to be displayed in the dropdown menu
    interpretationsList: {
      default: [],
    },

    // list of interpretations currently displayed in columns in the viewer
    formerInterpretationsList: {
      default: [],
    },
  },
  computed: {},

  mounted() {
    // get all the information about the interpretation displayed in this particular column in the browser
    this.interpretationFull = this.formerInterpretationsList.filter(
      (element) => element.id == this.interpretation_id
    )[0];

    // call a function to identify whether the currently logged-in user is a viewer, editor, or owner of the interpretation displayed in this column in the browser
    this.sharingSetting(
      this.interpretationFull.created_by,
      this.interpretationFull.shared_editors,
      this.interpretationFull.shared_viewers
    );
  },
  methods: {
    toggleStorybookStylefunction(styleselection) {
      this.styleoption = styleselection;
    },

    sharingSetting(owner, editors, viewers) {
      if (owner == this.$store.state.user.uid) {
        this.interpretationStatus = "owner";
      } else if (editors.includes(this.$store.state.user.uid)) {
        this.interpretationStatus = "editor";
      } else if (viewers.includes(this.$store.state.user.uid)) {
        this.interpretationStatus = "viewer";
      }
    },

    // when the user chooses to swap the interpretation they are currently viewing for a different interpretation...
    changeInterpretationIDfunction(newID) {
      let formerinterpretation = this.interpretation_id;
      this.$emit("displayInterpretationID", newID); // ...tell the parent component to create a new column for the new interpretation the user wants to view
      this.returnFormerInterpretation(formerinterpretation); // ...tell the parent component to remove this column currently being worked in
    },

    returnFormerInterpretation(formerinterpretation) {
      this.$emit("returnFormerInterpretation", formerinterpretation);
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

