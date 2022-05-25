<template>
  <div class="flex-auto">
    <SidebarAlt />
    <div class="flex flex-col">
      <Navbar />
      <Header title="Dito" image ="src/assets/ditologo.jpg" body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper orci in pellentesque condimentum. Pellentesque eu sem ornare, commodo urna vitae, tempus felis. Aenean sit amet magna sed sapien pharetra tempus eu a sem. Duis eget est egestas mi sollicitudin mattis. Maecenas placerat nulla nec dui posuere varius. Donec ultricies nulla at velit aliquet ornare. Donec pharetra tempor auctor. Maecenas ultrices ante commodo mi egestas, nec dictum nibh tincidunt." />
      <HorizontalPlayer />
      <Player />
      <CardList title="Browse Public Storybooks" />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Header from "@/components/Header.vue";
import CardList from "@/components/CardList.vue";
import SidebarAlt from "@/components/SidebarAlt.vue";
import Player from "@/components/PlayerVertical.vue";
import HorizontalPlayer from "@/components/PlayerHorizontal.vue";

export default {
  name: "Home",
  components: {
    Navbar,
    Header,
    CardList,
    SidebarAlt,
    Player,
    HorizontalPlayer,
  },
};
</script>
