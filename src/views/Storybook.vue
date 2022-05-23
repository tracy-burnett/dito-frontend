<template>
  <div class="flex-auto">
    <SidebarAlt />
    <div class="flex flex-col">
      <Navbar />
      <StorybookStyleMenu />
          <div class="flex items-center">
      <PlayerVertical :audio_ID="audio_ID" />
      <component v-bind:is="showStyleOption" :audio_id="audio_ID"></component> <!-- this is the viewer, editor, or tagger component -->
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";
import StorybookStyleMenu from "@/components/StorybookStyleMenu.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";
import Viewer from "@/components/Viewer.vue";
import Editor from "@/components/Editor.vue";
import Tagger from "@/components/Tagger.vue";

export default {
    name: "Storybook",
      data: () => {
    return {

    };
  },
      computed: {
      //We're not defining it here; we're using a computed property to reach out and get it.
      showStyleOption: function() {
        return this.$store.state.styleoption
      }
    },
    props: {
    audio_ID: "",
  },

    components: {
        Navbar,
        StorybookStyleMenu,
        PlayerVertical,
        Viewer,
        SidebarAlt,
        Editor,
        Tagger
    }
}
</script>

<style scoped>

</style>
