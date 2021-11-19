<template>
  <div class="home">
    <Navbar />
    <Header title="About" body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper orci in pellentesque condimentum. Pellentesque eu sem ornare, commodo urna vitae, tempus felis. Aenean sit amet magna sed sapien pharetra tempus eu a sem. Duis eget est egestas mi sollicitudin mattis. Maecenas placerat nulla nec dui posuere varius. Donec ultricies nulla at velit aliquet ornare. Donec pharetra tempor auctor. Maecenas ultrices ante commodo mi egestas, nec dictum nibh tincidunt." />
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Header from "@/components/Header.vue";

export default {
  name: "About",
  components: {
    Navbar,
    Header
  },
};
</script>
