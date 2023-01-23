<template>
	<div class="flex flex-col items-center pt-[2.2vh] ">
		<input
			class="px-3 fixed py-.5 text-sm border border-gray-300 rounded w-[70vw] md:w-[70vw] lg:w-[30vw]"
			placeholder="Search Storybooks (case-sensitive)"
			v-model="searchterm"
			@keyup.enter="search"
		/>
	</div>
	<div class="flex flex-col items-start hover:overflow-x-auto cardlist">
		<!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->

		<div
			v-if="searchResultAudioArray.length>0"
			class="pt-[9vh]  flex flex-row items-center"
		>
			<div
				v-for="audio in searchResultAudioArray"
				:key="audio.id"
			>
				<Card
					:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
					:uploader="audio.uploaded_by.display_name"
					:description="audio.description"
					:title="audio.title"
					:audio_ID="audio.id"
				/>
			</div>
		</div>
		<div
			v-else
			class=" pt-[9vh] flex flex-row items-center"
		>
			<div
				v-for="audio in audioArray"
				:key="audio.id"
			>
				<Card
					:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
					:uploader="audio.uploaded_by.display_name"
					:description="audio.description"
					:title="audio.title"
					:audio_ID="audio.id"
				/>
			</div>
		</div>
		<div
			v-if="processingStorybooks==true"
			class="flex flex-row flex-wrap justify-around basis-full pt-[10vh] lg:basis-2/5"
		>processing information from server; please wait...</div>

	</div>
</template>

<script>
import Card from "@/components/Card.vue";

export default {
	data() {
		return {
			audioArray: [], // the list of audio files owned by, or shared with, the logged-in user
			searchResultAudioArray: [],
			audioArrayTemp: [],
			searchterm: "",
			processingStorybooks: false,
		};
	},
	name: "PublicCardList",
	props: {
		title: {
			default: "Browse Public Storybooks",
		},
	},
	computed: {
		regexwithsearchterm() {
			if (this.searchterm != "") {
				return new RegExp(`${this.escapeRegex(this.searchterm)}+`, "g");
			} else {
				return "";
			}
		},
	},
	watch: {
		"$store.state.audioArrayChanged": function () {
			this.getStorybooks();
		},
	},
	components: {
		Card,
	},
	mounted() {
		// if (this.$store.state.idToken) {

		this.getStorybooks();
		history.pushState(null, null, location.href);
		window.onpopstate = function (event) {
			history.go(1);
		};
		// }
	},
	methods: {
		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		search() {
			// console.log(this.regexwithsearchterm);
			this.searchResultAudioArray = [...this.$store.state.audioArray];
			let i = 0;
			while (i < this.searchResultAudioArray.length) {
				let audio = this.searchResultAudioArray[i];
				let k = 0;
				if (audio.description.match(this.regexwithsearchterm)) {
					k++;
				}
				if (
					audio.last_updated_at.substring(0, 10).match(this.regexwithsearchterm)
				) {
					k++;
				}
				if (audio.title.match(this.regexwithsearchterm)) {
					k++;
				}
				if (
					audio.uploaded_at.substring(0, 10).match(this.regexwithsearchterm)
				) {
					k++;
				}

				if (audio.uploaded_by.anonymous == false) {
					if (audio.uploaded_by.display_name.match(this.regexwithsearchterm)) {
						k++;
					}
				}

				if (k == 0) {
					this.searchResultAudioArray.splice(i, 1);
				} else {
					i += 1;
				}
			}
		},

		async getStorybooks() {
			this.processingStorybooks = true;
			this.audioArray = [];
			this.audioArrayTemp = [];
			if (
				this.$store.state.audioArray &&
				this.$store.state.audioArray.length > 0
			) {
				this.processingStorybooks = false;
				this.audioArrayTemp = [...this.$store.state.audioArray];
				if (this.audioArrayTemp) {
					this.audioArrayTemp.forEach((audio) => {
						if (audio.archived == false) {
							this.audioArray.push(audio);
						}
					});
				}
			}
		},
	},
};
</script>

<style scoped>
.cardlist {
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-x: scroll;
}

.cardlist::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}

::placeholder {
	text-align: center;
}

/* or, for legacy browsers */

::-webkit-input-placeholder {
	text-align: center;
}

:-moz-placeholder {
	/* Firefox 18- */
	text-align: center;
}

::-moz-placeholder {
	/* Firefox 19+ */
	text-align: center;
}

:-ms-input-placeholder {
	text-align: center;
}
</style>