<template>
    <div class="flex flex-col border-t border-blue-900 hero bg-cyan-800 py-14 lg:px-16 px-5">
        
        <h1 class="text-gray-50 text-5xl font-extrabold mb-5">{{ title }}</h1>
        <p class="text-cyan-50 font-light text-sm lg:w-3/5 md:w-3/5 sm:w-full">{{ body }}</p>
    </div>

</template>

<script>

export default {
    name: "Header",
    props: ["title", "body"]
}
</script>

<style scoped>
.hero {
    background-image: url('../assets/logo.svg');
    background-repeat: no-repeat;
    background-size: 36%;
    background-position: right 3% center;
}
</style>