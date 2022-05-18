<template>
  <div class="h-full">
    <SidebarAlt />
    <Navbar text="dito" />
    <PlayerHorizontal audio_ID="Ha2gIvV_0CA.mp3"/>
    <div class="flex items-center">
    <PlayerVertical audio_ID="Ha2gIvV_0CA.mp3"/>
    <CardList :title="usernameStorybooks" />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import CardList from "@/components/CardList.vue";
import PlayerHorizontal from "@/components/PlayerHorizontal.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";

export default {
  name: "User",
  components: {
    Navbar,
    CardList,
    PlayerHorizontal,
    PlayerVertical,
    SidebarAlt
  },
  computed: {
    usernameStorybooks() {
      if (this.$store.state.user) {
        return this.$store.state.user.email + "'s Storybooks";
      } else {
        this.$router.replace("/");
      }
    },
  },

};
</script>

<style scoped>
</style>