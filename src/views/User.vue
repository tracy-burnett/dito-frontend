<template>
  <div class="h-full">
        <Navbar />
        <div class="flex items-center">
              <CardList :title="usernameStorybooks" :key="$store.state.dashboardRerender" />
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
    PlayerVertical,
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