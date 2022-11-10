<template>
	<div class="flex justify-around pt-12">
		<div class="flex flex-col items-center w-2/5 ">
			<h1 class="text-2xl font-bold text-slate-700">Upload Audio File</h1>
			<input
				class="w-full px-3 py-1 mt-12 mb-3 border border-gray-300 rounded"
				type="file"
				accept="audio/*,audio/mpeg,audio/mp4,audio-x/flac,audio/x-mpegurl,audio/x-wav"
				ref="audioInput"
				@keyup.enter="upload"
			/>
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Storybook/Audio Title"
				v-model="title"
				@keyup.enter="upload"
			/>
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Description of Content"
				v-model="description"
				@keyup.enter="upload"
			/>
		</div>
		<div class="flex flex-col items-center w-2/5">
			<h1 class="text-2xl font-bold text-slate-700">Start First Interpretation (optional)</h1>
			<br />
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Title of First Interpretation"
				v-model="int_title"
				@keyup.enter="upload"
			/>
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Language of First Interpretation"
				v-model="int_language"
				@keyup.enter="upload"
			/>
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="What character is this language 'spaced' by? (or leave blank)"
				v-model="int_spacing"
				maxlength="1"
				@keyup.enter="upload"
			/>
			<textarea
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="Text of First Interpretation"
				v-model="int_text_unstripped"
				style="overflow:hidden;"
				oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"'
			/>
		</div>
	</div>
    <div class="flex flex-col items-center">
	<button
		class="w-1/2 px-3 py-2 text-sm font-medium text-white transition-colors border rounded mt-7 border-sky-600 bg-sky-700 hover:bg-sky-600"
		@click="upload"
	>
		Upload
	</button></div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";

export default {
	name: "CreateStorybook",
	components: {
		Navbar,
	},
	data() {
		return {
			ext: "",
			name: "",
			title: "",
			description: "",
			int_title: "",
			int_text_unstripped: "",
			int_language: "",
			int_spacing: "",
			myArray: null,
			file: null,
		};
	},
	computed: {
		int_text() {
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
		async upload() {
			// get secure url from server
			this.file = this.$refs.audioInput.files[0];
			this.name = this.file["name"];
			this.myArray = this.name.split(".");
			this.ext = "." + this.myArray[this.myArray.length - 1];
			fetch(process.env.VUE_APP_api_URL + "s3/presignedposturl", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: this.$store.state.idToken,
				},
				body: JSON.stringify({
					ext: this.ext,
				}),
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log("uploading file, please wait");
					// upload audio to server
					fetch(
						data["url"],

						{ method: "PUT", body: this.file }
					)
						.then((response) => {
							// console.log(response);

							this.$store.commit("forcePlayerRerender", data["audio_ID"]);
							return;
						})
						.catch((error) => console.error("Error:", error));
					this.name = data["audio_ID"];

					return;
				})
				.then(() =>
					// post request to create new entry in audio table that includes data['audio_ID'], audio_URL (different from presigned URL), and other important information.
					{
						fetch(process.env.VUE_APP_api_URL + "audio/", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",

								Authorization: this.$store.state.idToken,
							},
							body: JSON.stringify({
								id: this.name.normalize("NFC"),
								// url: process.env.VUE_APP_SUBDOMAIN_URL,
								title: this.title.normalize("NFC"),
								description: this.description.normalize("NFC"),
								// shared_with: [],
							}),
						})
							.then((response) => {
								return response.json();
							})
							.then((response) => {
								console.log(response);
							})

							.then(() =>
								// post request to create new interpretation for this audio
								{
									this.$store.commit("toggleInfobit","InfoPublish")

									if (this.int_title || this.int_text || this.int_language) {
										fetch(
											process.env.VUE_APP_api_URL +
												"interpretations/audio/" +
												this.name +
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
												console.log(response);
											})
											.catch((error) => {
												console.error("Error:", error);
											});
									}

									return;
								}
							)
							.catch((error) => {
								console.error("Error:", error);
							});

						return;
					}
				)

				.catch((error) => {
					console.error("Error:", error);
				});
		},
	},
};
</script>

<style scoped>
</style>