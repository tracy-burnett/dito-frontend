<template>
	<div @click="openstorybook()"
		class="relative mb-[3vh] overflow-hidden transition-colors bg-white border-slate-300 border shadow-lg cursor-pointer hover:overflow-auto group card rounded-xl  hover:border-slate-400 hover:outline-2">
		<div class="relative flex items-center justify-between bg-emerald-800 flex-cols-2">
			<div class="absolute inset-0 opacity-0 bg-emerald-900 group-hover:opacity-100"></div>
			<!-- <div class=""> -->
			<!-- <img class="flex left-0 mt-[1vh] object-scale-down  w-1/3" :src="image" /> -->

			<div class="z-20 flex mt-1 ml-[1vw] mb-2 text-xl text-gray-100 group-hover:text-gray-50">{{ title
				}}</div>
			<div @click.stop="cardclicked"
				class=" shrink-0 relative z-20 my-[1vh] flex items-center justify-center w-10 h-10 mr-[1vw] rounded-full shadow-lg bg-cyan-700">
				<div class="absolute inset-0 z-30 rounded-full shadow-lg opacity-0 bg-cyan-800 ">
				</div>
				<!-- <img class="z-40 w-6 ml-1 storybookicon" src="@/assets/white_book_icon.svg"
					@click.stop="cardclicked" /> -->
					<img v-if="currentaudioid==audio_ID" class="z-40 w-10 h-10 " src="@/assets/pause.svg"
					 />
					<img v-else class="z-40 w-6 h-6 ml-1" src="@/assets/play.svg"
				/>
			</div>

			<!-- </div> -->
		</div>
		<!-- <hr class="mt-[1.4vh] border-lime-500"> -->

		<div class="px-4 py-2">
			<!-- <div class="mt-1 mb-2 text-xl font-bold " ref="storybooktitle">{{ title }}</div> -->
			<p class="mb-3 text-xs text-gray-400">
				{{ description }}
			</p>
			<label class="text-xs text-gray-400">Created by {{ uploader }} on {{ date }}</label>
		</div>

	</div>
</template>

<script>

// import cardbanner from "@/assets/IMG_0478.jpg";
// import browse from "@/assets/icon_detailed_browse.svg";

export default {
	name: "Card",

	props: {
		title: {
			default: "",
		},
		currentaudioid: {
			default: "",
		},
		// image: {
		// 	default: browse,
		// },

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



	// mounted() {

		// this.$refs.storybooktitle.scrollIntoView({ block: "center" });
	// },

	methods: {
		cardclicked() {
			this.$emit("clicked", this.audio_ID);
		},

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
	margin-left: 0.5vw;
	margin-right: 0.5vw;
	height: 27.5vh;
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-y: scroll;
}

.card::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
}

/* .play {
	top: calc(50% - 1.75rem);
	right: 0;
} */
</style>