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
				<img v-if="currentaudioid == audio_ID" class="z-40 w-10 h-10 " src="@/assets/pause.svg" />
				<img v-else class="z-40 w-6 h-6 ml-1" src="@/assets/play.svg" />
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

		<div class="py-1" :id="chartid">
			<!-- <p class="mb-3 text-xs text-gray-400">
				chart goes here
			</p> -->
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


	computed: {
		chartid() {
			return "id" + this.audio_ID.split(".")[0]
		},
	},

	mounted() {
		this.drawChart();
		// this.$refs.storybooktitle.scrollIntoView({ block: "center" });
	},

	methods: {

		drawChart() {
			// Sample dataset
			const data = [100, 200, 300];
			// Set dimensions and margins of the chart
			const margin = { top: 0, right: 0, bottom: 0, left: 0 },
				width = document.getElementById(this.chartid).clientWidth,
				height = 30;
			// Append the svg object to the #chart div
			const svg = d3.select("#" + this.chartid).append("svg")
				.attr("width", width - margin.left - margin.right)
				.attr("height", height - margin.top - margin.bottom)
				.append("g")
				.attr("transform", `translate(${margin.left},${margin.top})`);
			// Scale the range of the data in the domains
			const x = d3.scaleBand()
				.range([0, width + margin.left + margin.right])
				.padding(0.1);
			const y = d3.scaleLinear()
				.range([height, 0 + margin.top + margin.bottom]);
			x.domain(data.map((d, i) => i));
			y.domain([0, d3.max(data, (d) => d)]);
			// Append the rectangles for the bar chart
			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", (d, i) => x(i))
				.attr("width", x.bandwidth())
				.attr("y", (d) => y(d))
				.attr("height", (d) => height - y(d));
		},




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

/* 
#chart {
        position: relative;
        left: 0px;
        right: 0px;
        top: 0px;
        bottom: 0px;
      } */
/* .play {
	top: calc(50% - 1.75rem);
	right: 0;
} */
</style>