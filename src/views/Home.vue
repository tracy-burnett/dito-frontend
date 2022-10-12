<template>
  <div class="flex-auto">
    <div class="flex flex-col">
      <Navbar />
      <Header title="Dito" image ="src/assets/ditologo.jpg" body="A platform for developing useful teaching tools for language exchange and typing practice between Khroskyabs and English." />
      <PublicCardList title="Browse Public Storybooks" />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Header from "@/components/Header.vue";
import PublicCardList from "@/components/PublicCardList.vue";

export default {
  name: "Home",
  components: {
    Navbar,
    Header,
    PublicCardList,
  },
};
</script>
