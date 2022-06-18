<template>
	<div class="flex-auto">
		<div class="flex-1 flex-col h-full overflow-hidden">
			<Navbar />
			<div class="flex justify-center items-center h-full mt-10">
				<div class="
            flex flex-col
            items-center
            border border-gray-300
            bg-white
            shadow-md
            rounded-xl
            p-8
            xl:w-2/5
            lg:w-2/4
            md:w-2/3
          ">
					<h1 class="text-2xl font-bold">Upload Audio File</h1>
					<input
						class="border border-gray-300 rounded w-full mt-12 mb-3 px-3 py-1"
						type="file"
						accept="audio/*"
						ref="audioInput"
						@keyup.enter="upload"
					/>
					<input
						class="border border-gray-300 rounded w-full px-3 py-1"
						placeholder="Storybook/Audio Title"
						v-model="title"
						@keyup.enter="upload"
					/>
					<input
						class="border border-gray-300 rounded w-full px-3 py-1"
						placeholder="Description of Content"
						v-model="description"
						@keyup.enter="upload"
					/>
					<br /><br />
					<h1 class="text-2xl font-bold">Start First Interpretation</h1>
					<br />
					<input
						class="border border-gray-300 rounded w-full px-3 py-1"
						placeholder="Title of First Interpretation"
						v-model="int_title"
						@keyup.enter="upload"
					/>
					<input
						class="border border-gray-300 rounded w-full px-3 py-1"
						placeholder="Language of First Interpretation"
						v-model="int_language"
						@keyup.enter="upload"
					/>
					<input
						class="border border-gray-300 rounded w-full px-3 py-1"
						placeholder="What character is this language 'spaced' by? (or leave blank)"
						v-model="int_spacing"
						maxlength="1"
						@keyup.enter="upload"
					/>
					<textarea
						class="border border-gray-300 rounded w-full px-3 py-1"
						placeholder="Text of First Interpretation"
						v-model="int_text"
						style="overflow:hidden;"
						oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"'
					/>
					<button
						class="
              bg-indigo-500
              border border-indigo-400
              w-full
              text-sm
              px-3
              py-2
              mt-16
              rounded
              font-medium
              text-white
              hover:bg-indigo-400
              transition-colors
            "
						@click="upload"
					>
						Upload
					</button>
				</div>
			</div>
		</div>
	</div>
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
			int_text: "",
			int_language: "",
			int_spacing: "",
			myArray: null,
			file: null,
		};
	},
	methods: {
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
							console.log(response);

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
								id: this.name,
								url: "coverimage.jpg",
								title: this.title,
								description: this.description,
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
									this.$router.replace("/");

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
													title: this.int_title,
													latest_text: this.int_text,
													language_name: this.int_language,
													spaced_by: this.int_spacing,
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