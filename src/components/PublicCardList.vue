<template>
	<div class="flex flex-col items-center pt-[2.2vh] hover:overflow-x-auto cardlist">
		<input
			class="px-3 fixed py-.5 text-sm border border-gray-300 rounded w-[70vw] md:w-[70vw] lg:w-[30vw]"
			placeholder="Search Storybooks (not perfect yet)"
			v-model="searchterm"
			@keyup.enter="search"
		/>
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
import { getIdToken } from "firebase/auth";

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
			return new RegExp(`${this.escapeRegex(this.searchterm)}+`, "g");
		},
	},
	// watch: {
	//   "$store.state.idToken": function () {
	//     this.getStorybooks();
	//   },

	// },
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
			console.log(this.regexwithsearchterm);
			this.searchResultAudioArray = [...this.audioArray];
			let i = 0;
			while (i < this.searchResultAudioArray.length) {
				let audio = this.audioArray[i];
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

			if (this.$store.state.user) {
				// REFRESH ID TOKEN FIRST AND WAIT FOR IT
				await getIdToken(this.$store.state.user)
					.then((idToken) => {
						this.$store.commit("SetIdToken", idToken);
						// console.log(this.$store.state.idToken)
					})
					.catch((error) => {
						// An error happened.
						console.log("Oops. " + error.code + ": " + error.message);
					});
			}

			fetch(process.env.VUE_APP_api_URL + "audio/user/", {
				method: "GET",

				headers: {
					"Content-Type": "application/json",
					Authorization: this.$store.state.idToken,
				},
			})
				.then((response) => response.json()) // json to object
				.then((data) => {
					this.audioArrayTemp = data["audio files"]; // collect the list of audio files that are owned by, or shared with, the logged-in user
					if (this.audioArrayTemp.length > 0) {
						this.audioArrayTemp.forEach((audio) => {
							if (audio.archived == false) {
								this.audioArray.push(audio);
							}
						});
					}
					this.processingStorybooks = false;
				})
				.catch((error) => console.error("Error:", error));
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