<template>
  <div class="flex-auto">
    <SidebarAlt />
    <div class="flex flex-col">
      <Navbar />
      <Languagemenu />
          <div class="flex items-center">
      <PlayerVertical audio_ID="YTYcT2awNpo.mp3"/>
      <Viewer />
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";
import Languagemenu from "@/components/Languagemenu.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";
import Viewer from "@/components/Viewer.vue";

export default {
    name: "Storybook",
      data: () => {
    return {
audio_id,
    };
  },
    components: {
        Navbar,
        Languagemenu,
        PlayerVertical,
        Viewer,
        SidebarAlt
    }
}
</script>

<style scoped>

</style>
