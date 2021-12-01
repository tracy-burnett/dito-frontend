<template>
    <div class="lg:ml-16 mx-5">
        <h1 class="font-bold text-2xl mt-8 mb-6">{{ title }}</h1>
        <p class="text-indigo-200 font-light text-sm lg:w-2/3 md:w-3/4 sm:w-full">{{ body }}</p>
    </div>
</template>


<script>
export default {
    name: "Essay",
    props: ["title", "body"]
}
</script>

<style scoped>
</style>