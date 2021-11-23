<template>
    <div class="flex flex-col w-screen border-t border-indigo-500 hero py-14 lg:px-16 px-5">
        <h1 class="text-white text-5xl font-extrabold mb-5">{{ title }}</h1>
        <p class="text-gray-200 font-light text-sm lg:w-1/2 md:w-2/3 sm:w-full">{{ body }}</p>
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