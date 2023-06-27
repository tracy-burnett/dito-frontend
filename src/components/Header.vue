<template>
	<div class="overflow-hidden hero">

		<!-- <div class="cursor-pointer contents" v-if="browse == false" @mouseover="browse = true" @mouseleave="browse = false">
			<img class="object-scale-down h-[35vh] w-[20vw]" @click="$store.commit('toggleInfobit', 'PublicCardList');"
				:src="image1" />
		</div>
		<div class="flex flex-col items-center justify-center cursor-pointer h-[35vh] w-[20vw]"
			@click="$store.commit('toggleInfobit', 'PublicCardList');" @mouseover="browse = true" @mouseleave="browse = false"
			v-else>
			<p class="text-xs lg:text-sm">Click below to use your language skills to interpret an audio file uploaded by
				yourself or another user. Nobody will see your interpretation unless you share or publish it.</p>
		</div> -->

		<div v-if="LoginLogoutButton" class="grid grid-cols-3 justify-items-center  mx-[3vw]">


			<div class="cursor-pointer contents" v-if="contribute == false" @mouseover="contribute = true"
				@mouseleave="contribute = false">
				<img class="object-scale-down h-[35vh] w-[20vw]" @click="$store.commit('toggleInfobit', 'CreateStorybook');"
					:src="image2" />
			</div>

			<div class="flex flex-col items-center justify-center cursor-pointer h-[35vh] w-[20vw]"
				@click="$store.commit('toggleInfobit', 'CreateStorybook');" @mouseover="contribute = true"
				@mouseleave="contribute = false" v-else>
				<p class="text-xs md:text-sm">Click below to upload an authentic recording of a language or a dialect that
					you
					speak or care about.</p>
			</div>

			<div class="cursor-pointer contents" v-if="publish == false" @mouseover="publish = true"
				@mouseleave="publish = false">
				<img class="object-scale-down h-[35vh] w-[20vw]" @click="$store.commit('toggleInfobit', 'InfoPublish');"
					:src="image3" />
			</div>

			<div class="flex flex-col items-center justify-center cursor-pointer h-[35vh] w-[20vw]"
				@click="$store.commit('toggleInfobit', 'InfoPublish');" @mouseover="publish = true"
				@mouseleave="publish = false" v-else>
				<p class="text-xs md:text-sm">Click below to review, share, and publish (or unpublish) the audio files that
					you
					uploaded and the interpretations you wrote.</p>
			</div>
			<div class="cursor-pointer contents" v-if="revitalize == false" @mouseover="revitalize = true"
				@mouseleave="revitalize = false">
				<img class="object-scale-down h-[35vh] w-[20vw]" @click="$store.commit('toggleInfobit', 'InfoRevitalize');"
					:src="image4" />
			</div>

			<div class="flex flex-col items-center justify-center  cursor-pointer h-[35vh] w-[20vw]"
				@click="$store.commit('toggleInfobit', 'InfoRevitalize');" @mouseover="revitalize = true"
				@mouseleave="revitalize = false" v-else>
				<p class="text-xs lg:text-sm">Click below to enhance your language skills and exposure with listening
					comprehension, reading comprehension, and typing training exercises in the context of any published
					storybook.</p>
			</div>



			<!-- <p class="text-xs font-semibold text-center cursor-pointer md:text-sm"
			@click="$store.commit('toggleInfobit', 'PublicCardList');"
			:class="{ 'text-slate-700': $store.state.infobit != 'PublicCardList', 'text-slate-200': $store.state.infobit == 'PublicCardList' }">
			Explore and Collaborate</p> -->

			<p class="text-xs font-semibold text-center cursor-pointer md:text-sm"
				@click="$store.commit('toggleInfobit', 'CreateStorybook');"
				:class="{ 'text-slate-700': $store.state.infobit != 'CreateStorybook', 'text-slate-200': $store.state.infobit == 'CreateStorybook' }">
				Contribute Audio</p>
			<p class="text-xs font-semibold text-center cursor-pointer md:text-sm"
				@click="$store.commit('toggleInfobit', 'InfoPublish');"
				:class="{ 'text-slate-700': $store.state.infobit != 'InfoPublish', 'text-slate-200': $store.state.infobit == 'InfoPublish' }">
				Manage Storybooks</p>
			<p class="text-xs font-semibold text-center cursor-pointer md:text-sm "
				@click="$store.commit('toggleInfobit', 'InfoRevitalize');"
				:class="{ 'text-slate-700': $store.state.infobit != 'InfoRevitalize', 'text-slate-200': $store.state.infobit == 'InfoRevitalize' }">
				Learn and Revitalize</p>
		</div>
		<div v-else class="grid grid-cols-1 justify-items-center  mx-[3vw] mt-[1.7vh]">


			<div class="cursor-pointer contents" v-if="revitalize == false" @mouseover="revitalize = true"
				@mouseleave="revitalize = false">
				<img class="object-scale-down h-[35vh] w-[20vw]" @click="$store.commit('toggleInfobit', 'InfoRevitalize');"
					:src="image4" />
			</div>

			<div class="flex flex-col items-center justify-center  cursor-pointer h-[35vh] w-[20vw]"
				@click="$store.commit('toggleInfobit', 'InfoRevitalize');" @mouseover="revitalize = true"
				@mouseleave="revitalize = false" v-else>
				<p class="text-xs lg:text-sm">Enhance your language skills with listening
					comprehension, reading comprehension, and typing training exercises.</p>
			</div>



			<p class="text-xs font-semibold text-center cursor-pointer md:text-sm "
				@click="$store.commit('toggleInfobit', 'InfoRevitalize');"
				:class="{ 'text-slate-700': $store.state.infobit != 'InfoRevitalize', 'text-slate-200': $store.state.infobit == 'InfoRevitalize' }">
				Learn and Revitalize</p>



		</div>
	</div>
</template>

<script>
import browse from "@/assets/icon_detailed_browse.svg";
import revitalize from "@/assets/icon_detailed_revitalize.svg";
import contribute from "@/assets/icon_detailed_contribute.svg";
import publish from "@/assets/icon_detailed_publish.svg";
import InfoRevitalize from "@/components/InfoRevitalize.vue";

export default {
	name: "Header",

	components: { InfoRevitalize },
	data: () => {
		return {
			browse: false,
			contribute: false,
			publish: false,
			revitalize: false,
		};
	},

	props: {
		image1: {
			default: browse,
		},
		image2: {
			default: contribute,
		},
		image3: {
			default: publish,
		},
		image4: {
			default: revitalize,
		},
		title: {
			default: window.location.hostname,
			//   default: window.location.hostname.split(".")[0],
		},
		// body: {
		//   default: "The goal of the dialect interpretation & translation online (Dito) tool is to promote language revitalization and language equity in knowledge production. Dito hopes to shed light on the importance of the knowledge embedded in the words, syntax, and expressions of colloquial speech.  Other languages can be used to approximate meaning, but any translations of the original should never supersede the authority of the original spoken word.",
		// },
	},

	computed: {
		//We're not defining it here; we're using a computed property to reach out and get it.
		LoginLogoutButton: function () {
			return this.$store.state.user;
		},
	},
};
</script>

<style scoped>
/* .beforehero {
	height: 25px;
	background-image: linear-gradient(
		#111827 0%,
		hsla(0, 0%, 0%, 0.738) 19%,
		hsla(0, 0%, 0%, 0.541) 34%,
		hsla(0, 0%, 0%, 0.382) 47%,
		hsla(0, 0%, 0%, 0.278) 56.5%,
		hsla(0, 0%, 0%, 0.194) 65%,
		hsla(0, 0%, 0%, 0.126) 73%,
		hsla(0, 0%, 0%, 0.075) 80.2%,
		hsla(0, 0%, 0%, 0.042) 86.1%,
		hsla(0, 0%, 0%, 0.021) 91%,
		hsla(0, 0%, 0%, 0.008) 95.2%,
		hsla(0, 0%, 0%, 0.002) 98.2%,
		hsla(0, 0%, 0%, 0) 100%
	);
} */
.hero {
	/* position: relative; */
	background-color: transparent;
	/* margin-top:-25px; */
	/* height: 33vh; */
	/* padding-top: 29px; */
	/* padding-bottom: 14px; */
	/* url('../assets/dito_logo_main.svg'); */
}

.hero::before {
	content: " ";
	z-index: -1;
	position: absolute;
	width: 100vw;
	left: 0;
	height: 58vh;
	background-image: linear-gradient(rgb(0.784% 51.765% 78.039%) 0%,
			rgb(0.941% 52.027% 78.356%) 6.25%,
			rgb(1.421% 52.81% 79.296%) 12.5%,
			rgb(2.258% 54.105% 80.826%) 18.75%,
			rgb(3.506% 55.892% 82.891%) 25%,
			rgb(5.241% 58.149% 85.417%) 31.25%,
			rgb(7.56% 60.843% 88.304%) 37.5%,
			rgb(12.183% 63.425% 89.834%) 43.75%,
			rgb(21.156% 65.241% 87.961%) 50%,
			rgb(30.833% 67.456% 86.332%) 56.25%,
			rgb(41.028% 70.131% 85.13%) 62.5%,
			rgb(51.535% 73.33% 84.563%) 68.75%,
			rgb(62.126% 77.128% 84.859%) 75%,
			rgb(72.551% 81.603% 86.268%) 81.25%,
			rgb(82.538% 86.843% 89.062%) 87.5%,
			rgb(91.792% 92.942% 93.534%) 93.75%,
			rgb(100% 100% 100%) 100%);

	/* filter: invert(29%) sepia(22%) saturate(1408%) hue-rotate(148deg) brightness(100%) contrast(96%); */
	/* background-repeat: no-repeat; */
	/* background-size: 32%;
    background-position: right 9% top;
    min-width: 42rem; */
}
</style>