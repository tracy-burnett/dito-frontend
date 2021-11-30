<template>
    <div class="lg:ml-16 mx-5">
        <h1 class="font-bold text-2xl mt-8 mb-6">{{ title }}</h1>
        <div class="flex items-center">
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
.flex {
    flex-wrap: wrap;
}
</style>