<template>
    <div class="flex justify-between items-center bg-indigo-600 px-5 py-2">
        <router-link class="text-2xl text-white font-bold" to="/">Xygil</router-link>
        <div class="flex">
            <router-link class="bg-indigo-500 text-sm px-3 py-2 rounded font-medium text-gray-100 hover:bg-indigo-400 transition-colors" to="/login">LOGIN</router-link>
            <img src="@/assets/menu-outline.svg" class="w-8 ml-8">
        </div>
    </div>
</template>

<script>
export default {
    name: 'Navbar'
}
</script>

<style scoped>

</style>