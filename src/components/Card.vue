<template>
	<div
		@click="openstorybook()"
		class="relative mb-[3vh] overflow-hidden transition-colors bg-white border-slate-300 border shadow-lg cursor-pointer hover:overflow-auto card rounded-xl  hover:border-cyan-600"
	>
		<img
			class="object-cover w-full h-1/2"
			:src="image"
		/>
		<div class="px-4 py-2">
			<div
				class="mt-1 mb-2 text-xl font-bold"
				ref="storybooktitle"
			>{{ title }}</div>
			<p class="mb-3 text-xs text-gray-400">
				{{ description }}
			</p>
			<label class="text-xs text-gray-400">Created by {{ uploader }} on {{ date }}</label>
		</div>
		<div class="absolute flex items-center justify-center mr-4 rounded-full shadow-lg bg-sky-700 h-14 w-14 play">
			<img
				class="w-8 h-8 ml-1 text-white"
				src="@/assets/play.svg"
			/>
		</div>
	</div>
</template>

<script>
import cardbanner from "@/assets/IMG_0478.jpg";

export default {
	name: "Card",

	props: {
		title: {
			default: "",
		},

		image: {
			default: cardbanner,
		},

		description: {
			default: "",
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

	mounted() {
		this.$refs.storybooktitle.scrollIntoView({ block: "center" });
	},

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
	width: 30.1vh;
	margin-left: .5vw;
	margin-right: .5vw;
	height: 27.5vh;
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;
}

.card::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}
.play {
	top: calc(50% - 1.75rem);
	right: 0;
}
</style>