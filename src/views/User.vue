<template>
  <div class="h-full">
    <Navbar text="dito" />
    <!-- <PlayerHorizontal /> -->
    <div class="flex items-center">
    <PlayerVertical />
    <CardList :title="usernameStorybooks" />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import CardList from "@/components/CardList.vue";
import PlayerHorizontal from "@/components/PlayerHorizontal.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";

export default {
  name: "User",
  components: {
    Navbar,
    CardList,
    PlayerHorizontal,
    PlayerVertical
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