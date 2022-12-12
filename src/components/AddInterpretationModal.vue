<template>
	<div
		class="flex flex-col items-center justify-center flex-1 flex-auto h-full backdrop"

	>
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Start New Interpretation</h1>
			<br />
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Title of New Interpretation"
				v-model="int_title"
			/>
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Language of New Interpretation"
				v-model="int_language"
			/>
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="What character is this language 'spaced' by? (or leave blank)"
				v-model="int_spacing"
				maxlength="1"
			/>
			<textarea
				class="
        form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
      "
				placeholder="Text of New Interpretation"
				v-model="int_text_unstripped"
				rows="5"
				style="overflow-y: scroll"
			/>
			<button
				class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors border rounded bg-cyan-700 border-cyan-600 hover:bg-cyan-600"
				@click="create"
			>
				Create Interpretation
			</button>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "AddInterpretationModal",
	components: {},
	data() {
		return {
			int_title: "",
			int_text_unstripped: "",
			int_language: "",
			int_spacing: "",
		};
	},
	props: {
		audio_id: {
			default: "",
		},
	},
	computed: {
		// split by carriage returns and get rid of any spaced_by characters at the beginning and end of each element
		int_text() {
			if (this.spaced_by != "") {
				let stripped = this.int_text_intermediary.split("\n");
				for (let j = 0; j < stripped.length; j++)
				{
					if (stripped[j][0]==this.spaced_by) {
						stripped[j]=stripped[j].substring(1)
					}
					if (stripped[j][stripped[j].length-1]==this.spaced_by) {
						stripped[j]=stripped[j].substring(0,stripped[j].length-1)
					}
				}
				
				// console.log(stripped.join("\n"));
				return stripped.join("\n");
			} else if (this.spaced_by == "") {
				return this.int_text_intermediary;
			}
		},

		// gets rid of streaks of spaced_by characters; replaces them with a single spaced_by character
		int_text_intermediary() {
			if (this.int_spacing != "") {
				let stripped = this.int_text_unstripped.replace(
					this.regexwithmultiplespacedby,
					this.int_spacing
				);
				return stripped;
			} else if (this.int_spacing == "") {
				return this.int_text_unstripped;
			}
		},

		regexwithmultiplespacedby() {
			return new RegExp(`${this.escapeRegex(this.int_spacing)}+`, "g");
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
				this.int_text != "" ||
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
							latest_text: this.int_text.normalize("NFC"),
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
			this.$emit("closeInterpretationModal");
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
</style>