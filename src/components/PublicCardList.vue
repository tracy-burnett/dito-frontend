<template>
	<div class="flex flex-col items-center pt-[2.2vh] ">
		<input class="px-3 fixed py-.5 text-sm border border-gray-300 rounded w-[70vw] md:w-[70vw] lg:w-[30vw]"
			placeholder="Search Storybooks" v-model="searchterm" @keyup.enter="search" />
	</div>
	<div class="flex flex-col items-start hover:overflow-x-auto cardlist">
		<!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->

		<div v-if="searchResultAudioArray.length > 0" class="pt-[9vh]  flex flex-row items-center">
			<div v-for="audio in searchResultAudioArray" :key="audio.id">
				<Card :date="audio.uploaded_at.substring(0, 10) + ' UTC'" :uploader="audio.uploaded_by.display_name"
					:description="audio.description" :title="audio.title" :audio_ID="audio.id"
					@clicked="audioPlayPause($event)" />
			</div>
		</div>
		<div v-else class=" pt-[9vh] flex flex-row items-center">
			<div v-for="audio in audioArray" :key="audio.id">
				<Card :date="audio.uploaded_at.substring(0, 10) + ' UTC'" :uploader="audio.uploaded_by.display_name"
					:description="audio.description" :title="audio.title" :audio_ID="audio.id"
					@clicked="audioPlayPause($event)" />
			</div>
		</div>
	</div>
	<div v-if="processingStorybooks == true"
		class="flex flex-row flex-wrap justify-around basis-full pt-[10vh] lg:basis-2/5">processing information from
		server; please wait...</div>

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
			searchResultAudioArrayTemp: [],
			searchterm: "",
			processingStorybooks: false,
			currentaudioid: "",
			oldaudioid: "",
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


				return new RegExp(`${this.escapeRegex(this.searchterm.normalize("NFC")).replaceAll(/[Iıİi]/g, '[Iıİi]')}+`, "ugi");
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
	async mounted() {
		// if (this.$store.state.idToken) {

		this.getStorybooks();
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
		this.audioplayer = new Audio();
		// history.replaceState(history.state, '', location.href);
		// window.onpopstate = function (event) {
		// 	history.go(1);
		// };
		// }
	},
	methods: {

		onCanPlay() {
			// Play the audio
			this.audioplayer.play();
			this.oldaudioid = this.currentaudioid
			this.audioplayer.removeEventListener('canplay', this.onCanPlay, { once: true });
		},

		audioPlayPause(audio_ID) {
			if (audio_ID == this.oldaudioid) {
				this.audioplayer.pause()
				this.oldaudioid = ""
			}
			else {
				this.currentaudioid = audio_ID
				this.audioplayer.pause()
				const apiUrl = process.env.VUE_APP_api_URL + "s3/presignedgeturl";
				fetch(apiUrl, {
					method: "POST",

					headers: {
						"Content-Type": "application/json",
						Authorization: this.$store.state.idToken,
					},

					body: JSON.stringify({
						audio_ID: audio_ID,
					}),
				})
					.then((response) => {
						return response.json();
					})
					.then((data) => {
						// console.log(data)
						this.audioURL = data["url"];
						this.audioplayer.src = this.audioURL; // path to file
						console.log("about to play " + audio_ID)
						this.audioplayer.addEventListener('canplay', this.onCanPlay(audio_ID), { once: true });


					})
					.catch((error) => {
						console.error("Error:", error);
					});
			}
		},

		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		search() {
			// console.log(this.regexwithsearchterm);
			this.searchResultAudioArray = []
			this.searchResultAudioArrayTemp = [...this.$store.state.audioArray];

			if (this.searchResultAudioArrayTemp) {
				this.searchResultAudioArrayTemp.forEach((audio) => {
					if (audio.archived == false) {
						this.searchResultAudioArray.push(audio);
					}
				});
			}

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
				if (audio.searchablestring.match(this.regexwithsearchterm)) {
					k++;
				}
				if (
					audio.uploaded_at.substring(0, 10).match(this.regexwithsearchterm)
				) {
					k++;
				}

				if (audio.uploaded_by.anonymous == false || audio.uploaded_by.anonymous === undefined) {
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
			else if (this.$store.state.audioArray &&
				this.$store.state.audioArray.length == 0) { this.processingStorybooks = false; }

		},
	},
};
</script>

<style scoped>
.cardlist {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-x: scroll;
}

.cardlist::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
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