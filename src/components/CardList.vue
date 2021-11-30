<template>
    <div class="lg:mx-16 mx-5">
        <h1 class="font-bold text-2xl mt-8 mb-6">{{ title }}</h1>
        <div class="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-8">
            <Card />
            <Card />
            <Card />
            <Card />
        </div>
    </div>
</template>

<script>
import Card from "@/components/Card.vue";

export default {
    name: "CardList",
    props: ["title", "cards"],
    components: {
        Card   
    }
}
</script>

<style scoped>

</style>