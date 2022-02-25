<template>
  <div class="h-full overflow-hidden">
    <Navbar text="dito" />
    <CardList :title="usernameStorybooks" />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import CardList from "@/components/CardList.vue";

export default {
  name: "User",
  components: {
    Navbar,
    CardList,
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