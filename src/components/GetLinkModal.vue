<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop" @mousedown.self="closeModal">
		<div
			class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button class="mx-4 my-2 text-xl text-gray-500" @click.prevent="closeModal()">
				×
			</button>
			<h1 class="text-2xl font-bold">Get Shareable Link</h1>
			<br />
            <p class="text-center">This static link will only work for recipients if all elements (the audio file and all currently displayed interpretations of it) are public or have been shared with recipients' Dito accounts.</p>
<br>
            <textarea class="w-full text-center" autofocus="true" readonly @click="$event.target.select()" onfocus='this.style.height = "";this.style.height = this.scrollHeight + "px"' ref="currenturl">{{currenturl}}</textarea>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "GetLinkModal",
	components: {},
	data() {
		return {
			int_title: "",
			int_language: "",
			int_spacing: "",
		};
	},
	props: {
		audio_id: {
			default: "",
		},
	},
    mounted(){
        
				this.$refs.currenturl.focus();
    },
	computed: {
		// split by carriage returns and get rid of any spaced_by characters at the beginning and end of each element

        currenturl() {
            let baseurl = window.location.href.split("?")[0] + "?open="
            for (let i=0; i < this.$store.state.consoles.length; i++) {
                baseurl = baseurl + this.$store.state.consoles[i]
            }
            return baseurl

        },
		regexwithmultiplespacedby() {
			return new RegExp(`${this.escapeRegex(this.int_spacing)}+`, "ug");
		},
	},
	methods: {
		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},
		async create() {
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

			if (
				this.int_title != "" ||
				this.int_language != ""
			) {
				fetch(
					process.env.VUE_APP_api_URL +
					"interpretations/audio/" +
					this.audio_id +
					"/",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",

							Authorization: this.$store.state.idToken,
						},
						body: JSON.stringify({
							title: this.int_title.normalize("NFC"),
							latest_text: "",
							language_name: this.int_language.normalize("NFC"),
							spaced_by: this.int_spacing.normalize("NFC"),
							public: false,
						}),
					}
				)
					.then((response) => {
						return response.json();
					})
					.then((response) => {
						// console.log(response.interpretation);
						// if the interpretation was created successfully, then tell the parent component to add it to the list of interpretations potentially displayed in the dropdown menu, and tell the Vuex store that we need to add another column to the main screen for viewing the new interpretation
						this.$emit("addCreatedInterpretation", response.interpretation);
						this.$emit("closeInterpretationModal");
					})
					.catch((error) => {
						console.error("Error:", error);
					});
			}
		},

		closeModal() {
			this.$emit("closeGetLinkModal");
		},
	},
};
</script>

<style scoped>
.backdrop {
	background: rgba(0, 0, 0, 0.5);
	position: fixed;
	width: 100%;
	height: 100%;
}

.modal {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-y: scroll;
}

.modal::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
}
</style>