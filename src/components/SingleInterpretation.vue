<template>
  <div>
    <div>

      <StorybookStyleMenu
        @toggleStorybookStyle="toggleStorybookStyle($event)"
      />
      <SelectInterpretationMenu
        :interpretationsList="interpretationsList"
        @changeInterpretationID="changeInterpretationID($event)"
      />
    </div>
    <br /><br /><br /><br /><br />
    <div>
      <component
        v-bind:is="styleoption"
        :audio_id="audio_id"
        :interpretationStatus="interpretationStatus"
        :interpretation_id="interpretation_id"
      ></component>
      <DeleteInterpretationViewer 
        :interpretation_id="interpretation_id" 
        @returnFormerInterpretation="returnFormerInterpretation($event)"/>
    </div>
    <!-- this is the viewer, editor, or tagger component -->
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

  data: () => {
    return {
      interpretationStatus: "",
      // interpretation_id: "",
      styleoption: "Viewer",
      interpretationFull: {}
    };
  },
  mounted() {
    // get the information about status out of the interpretation, which should be inherited from Storybook
    this.interpretationFull=this.formerInterpretationsList.filter(element => element.id == this.interpretation_id)
    // console.log(JSON.stringify(this.interpretationFull))
    this.sharingSetting(this.interpretationFull[0].created_by,
                this.interpretationFull[0].shared_editors,
                this.interpretationFull[0].shared_viewers)
  },
  props: {
    audio_id: {
      default: "",
    },       
     interpretation_id: {
      default: "",
    },    
    interpretationsList: {
      default: [],
    },
        formerInterpretationsList: {
      default: [],
    },
  },
  computed: {},
  components: {
    Editor,
    Viewer,
    Tagger,
    StorybookStyleMenu,
    SelectInterpretationMenu,
    DeleteInterpretationViewer,
  },
  methods: {
    toggleStorybookStyle(styleselection) {
      this.styleoption = styleselection;
    },

        sharingSetting(owner, editors, viewers) {
console.log(owner)
console.log(this.$store.state.user.uid)
      if (owner == this.$store.state.user.uid) {
        this.interpretationStatus="owner"
      } else if (editors.includes(this.$store.state.user.uid)) {
        this.interpretationStatus="editor"
      } else if (viewers.includes(this.$store.state.user.uid)) {
        this.interpretationStatus="viewer"
      }
      
    },

    changeInterpretationID(newID) {
      let formerinterpretation=this.interpretation_id
      console.log("former" + formerinterpretation)
      console.log("intid" + this.interpretation_id)
      console.log("newID" + newID)
            this.$emit("changeInterpretationID", newID);
            this.returnFormerInterpretation(formerinterpretation)
    },

    returnFormerInterpretation(formerinterpretation) {
            this.$emit("returnFormerInterpretation", formerinterpretation);
            console.log("former interpretation from singleInt" + formerinterpretation)
    },

    // changeInterpretationStatus(newStatus) {
    //   this.interpretationStatus = newStatus;
    //   console.log("STATUS " + this.interpretationStatus)
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

