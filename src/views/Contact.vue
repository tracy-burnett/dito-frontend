<template>
  <div class="home">
    <Navbar text="Xygil" />
    <Header title="Contact" body="Are you a social science researcher with hours of recorded audio interviews that you would love to understand better? Are you struggling to revive a language or dialect that you care about? Do you want to learn what it feels like to think in another language? You've come to the right place." />
    <Essay title="Contact" body="Lorem ipsum" />
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
