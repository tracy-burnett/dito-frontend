<template>
    <div class="bg-white overflow-hidden rounded-xl relative shadow-lg border cursor-pointer hover:border-indigo-500 transition-colors">
        <img class="h-1/2 w-full" src="https://news.cgtn.com/news/7951544e3141444e3241444f324d444e3041444f31457a6333566d54/img/9e5aaea84367492ba672cb918e8bf62e/9e5aaea84367492ba672cb918e8bf62e.jpg" alt="Sunset in the mountains">
        <div class="px-4 py-2">
            <div class="font-bold text-xl mt-1 mb-2">Lorem Ipsum</div>
            <p class="text-gray-400 text-xs mb-3">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis  ...
            </p>
            <label class="text-gray-400 text-xs">Created by Alex McDowell on 10/26/2021</label>
        </div>
        <div class="flex justify-center items-center bg-indigo-500 absolute h-14 w-14 rounded-full play shadow-lg mr-4">
            <img class="text-white h-8 w-8 ml-1" src="@/assets/play.svg" />
        </div>
    </div>
</template>

<script>
export default {
    
}
</script>

<style scoped>
.play {
    top: calc(50% - 1.75rem);
    right: 0;
}
</style>