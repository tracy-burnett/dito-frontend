<template>
	<div class="flex flex-col items-center pt-[2.2vh] ">
		<input class="px-3 absolute py-.5 text-sm border border-gray-300 rounded w-[70vw] md:w-[70vw] lg:w-[30vw]"
			placeholder="Search" v-model="searchterm" @keyup.enter="search" />
	</div>
	<div ref="scrollingcards" class="flex flex-col items-start overscroll-none hover:overflow-x-auto cardlist">
		<!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->

		<div @mouseenter="scrollLeft" @mouseleave="noScroll" @touchstart="scrollLeft" @focusout="noScroll"
			@touchend="noScroll" :class="{ scrollhover: scrollingLeft == true, notscrolling: scrollingLeft == false }"
			class="scrollbutton absolute z-30    cursor-pointer left-[1vh] md:left-[3vh] text-lg font-extrabold border-[3px]  rounded-full pr-2 pl-2">
			<p>&lt;</p>
		</div>
		<div @mouseenter="scrollRight" @mouseleave="noScroll" @touchstart="scrollRight" @focusout="noScroll"
			@touchend="noScroll" :class="{ scrollhover: scrollingRight == true, notscrolling: scrollingRight == false }"
			class="scrollbutton absolute z-30  cursor-pointer right-[1vh] md:right-[3vh] text-lg  font-extrabold border-[3px] rounded-full pr-2 pl-2">
			<p>></p>
		</div>
		<div v-if="searchResultAudioArray.length > 0" class="pt-[9vh]  flex flex-row items-center">
			<div v-for="audio in searchResultAudioArray" :key="audio.id">
				<Card :date="audio.uploaded_at.substring(0, 10) + ' UTC'" :uploader="audio.uploaded_by.display_name"
					:description="audio.description" :currentaudioid="currentaudioid" :title="audio.title"
					:audio_ID="audio.id" @clicked="audioPlayPause($event)" />
			</div>
		</div>
		<div v-else class=" pt-[9vh] flex flex-row items-center">
			<div v-for="audio in audioArray" :key="audio.id">
				<Card :date="audio.uploaded_at.substring(0, 10) + ' UTC'" :uploader="audio.uploaded_by.display_name"
					:description="audio.description" :currentaudioid="currentaudioid" :title="audio.title"
					:audio_ID="audio.id" @clicked="audioPlayPause($event)" />
			</div>
		</div>
	</div>
	<div v-if="processingStorybooks == true"
		class="flex flex-row flex-wrap justify-around basis-full pt-[10vh] lg:basis-2/5">processing information from
		server; please wait...</div>

	<div v-if="$store.state.portalname == 'sfcanto'" class="flex justify-center">
		<button class=" dropbtn border-emerald-900 bg-emerald-800 hover:bg-emerald-900" @click="openPhraseRequest"
			:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">

			REQUEST A NEW PHRASE
		</button>
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
			searchResultAudioArrayTemp: [],
			searchterm: "",
			processingStorybooks: false,
			currentaudioid: "",
			oldaudioid: "",
			scrollingLeft: false,
			scrollingRight: false,
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

	beforeUnmount() { clearInterval(window.handle) },
	unmounted() {
		this.audioplayer.pause()
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
		scrollLeft() {
			clearInterval(window.handle)
			this.scrollingLeft = true
			window.handle = setInterval(this.scrollLeftHelper, .02);
		},

		scrollLeftHelper() {
			this.$refs.scrollingcards.scrollLeft -= 2
		},

		scrollRight() {
			clearInterval(window.handle)
			this.scrollingRight = true;
			window.handle = setInterval(this.scrollRightHelper, .02);

		},

		scrollRightHelper() {
			this.$refs.scrollingcards.scrollLeft += 2
		},

		noScroll() {
			this.scrollingLeft = false;
			this.scrollingRight = false;
			clearInterval(window.handle)
		},

		openPhraseRequest() {
			window.open('https://forms.gle/D4UiGqzKbtBbXr7V7', '_blank').focus();
		},
		onEnded() {

			this.oldaudioid = ""
			this.currentaudioid = ""
		},

		onCanPlay() {
			// Play the audio
			this.audioplayer.play();
			this.oldaudioid = this.currentaudioid
			// the line below is not needed because once was invoked
			// this.audioplayer.removeEventListener('canplay', this.onCanPlay, { once: true }); 
			this.audioplayer.addEventListener('ended', this.onEnded, { once: true })
		},

		audioPlayPause(audio_ID) {
			if (audio_ID == this.oldaudioid) {
				this.audioplayer.pause()
				this.oldaudioid = ""
				this.currentaudioid = ""
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
.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 1vh 3vh;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	/* margin: 4px 2px; */
	cursor: pointer;
	border-radius: 16px;
}

.cardlist {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-x: scroll;
	/* scroll-behavior: smooth; */
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

.scrollbutton {
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

.scrollhover {
	border-color: #065f46;
	color: #f9fafb;
	opacity: 90;
	background-color: #065f46;
}

.notscrolling {
	color: #065f46;
	border-color: #065f46;
	opacity: 60;

}

/* @media (pointer: fine) {
	.scrollarrow {
		z-index: 30
	}
}

@media (pointer: coarse) {
	.scrollarrow {
		z-index: -1
	}
} */
</style>