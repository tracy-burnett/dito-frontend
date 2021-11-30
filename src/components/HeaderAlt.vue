<template>
    <div class="flex flex-col hero py-14 lg:px-16 px-5">
        <h1 class="text-white text-6xl font-extrabold mb-5">{{ title }}</h1>
        <p class="text-gray-200 font-light text-sm lg:w-2/3 md:w-3/4 sm:w-full">{{ body }}</p>
    </div>
</template>

<script>
export default {
    name: "Header",
    props: ["title", "body", "image"]
}
</script>

<style scoped>
.hero {
    background: #4F46E5;
}
</style>