<template>
    <div class="flex justify-between items-center bg-indigo-600 px-5 py-3">
        <router-link class="text-xl text-white font-semibold" to="/">{{ text }}</router-link>
        <div class="flex">
            <router-link class="bg-indigo-500 text-sm px-3 py-2 rounded font-medium text-gray-100 hover:bg-indigo-400 transition-colors" to="/login">LOGIN</router-link>
            <img src="@/assets/menu-outline.svg" class="cursor-pointer w-8 ml-8" @click="toggleSidebar">
        </div>
    </div>
</template>

<script>
export default {
    name: 'Navbar',
    props: ["text"],
    methods: {
        toggleSidebar() {
            this.$store.commit("toggleSidebar", this.$store.state.sidebar ? false : true);
        }
    }
}
</script>

<style scoped>

</style>