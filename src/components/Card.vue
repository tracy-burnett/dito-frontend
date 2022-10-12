<template>
  <div
    @click="openstorybook()"
    class="relative mb-8 overflow-hidden transition-colors bg-white border shadow-lg cursor-pointer  card rounded-xl mr-7 hover:border-cyan-600"
  >
    <img class="w-full h-1/2" :src="image" alt="Sunset in the mountains" />
    <div class="px-4 py-2">
      <div class="mt-1 mb-2 text-xl font-bold">{{ title }}</div>
      <p class="mb-3 text-xs text-gray-400">
        {{ description }}
      </p>
      <label class="text-xs text-gray-400"
        >Created by {{ uploader }} on {{ date }}</label
      >
    </div>
    <div
      class="absolute flex items-center justify-center mr-4 rounded-full shadow-lg  bg-sky-700 h-14 w-14 play"
    >
      <img class="w-8 h-8 ml-1 text-white" src="@/assets/play.svg" />
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",

  props: {
    title: {
      default: "",
    },

    image: {
      default:
        "https://news.cgtn.com/news/7951544e3141444e3241444f324d444e3041444f31457a6333566d54/img/9e5aaea84367492ba672cb918e8bf62e/9e5aaea84367492ba672cb918e8bf62e.jpg",
    },

    description: {
      default:
        "",
    },

    uploader: {
      default: "",
    },

    date: {
      default: "",
    },

    audio_ID: {
      default: "",
    },
  },

  mounted() {},

  methods: {
    openstorybook() {
      this.$router.push({
        name: "Storybook",
        params: { audio_ID: this.audio_ID },
      });
    },
  },
};
</script>

<style scoped>
.card {
  width: 310px;
}

.play {
  top: calc(50% - 1.75rem);
  right: 0;
}
</style>