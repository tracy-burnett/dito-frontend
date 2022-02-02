<template>
  <div class="home">
    <Navbar text="Xygil" />
    <Header title="About" body="1" />
    <Essay title="About" body1="2" body2="3"/>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Header from "@/components/Header.vue";
import Essay from "@/components/Essay.vue";

export default {
  name: "About",
  components: {
    Navbar,
    Header,
    Essay
  },
};
</script>
