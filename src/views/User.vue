<template>
    <div class="h-full overflow-hidden">
        <Navbar />
        <CardList title="My Storybooks" />
    </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import CardList from "@/components/CardList.vue";

export default {
    name: "User",
    components: {
        Navbar,
        CardList
    }
}
</script>

<style scoped>

</style>