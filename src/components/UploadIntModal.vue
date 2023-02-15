<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop">
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Upload .srt Interpretation File</h1>
			<br />
			<input
				class="w-full px-3 py-1 mt-12 mb-3 border border-gray-300 rounded"
				type="file"
				accept=".srt, .txt"
				ref="interpretationInput"
			/>
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
			<br>

			<button
				class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors border rounded bg-cyan-700 border-cyan-600 hover:bg-cyan-600"
				@click="upload"
			>
				Upload Interpretation
			</button>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "UploadIntModal",
	components: {},
	data() {
		return {
			int_title: "",
			int_text_unstripped: "",
			int_language: "",
			fileloaded: "",
			int_spacing: "",
			file: null,
			captions: [],
			// maxTimestampArray: [], // to make sure none of them exceed the length of the audio file
			timestampsforBackend: [],
			offsetsforBackend: [],
			new_associations: {},
			captions_cleaned: [], // no weird stuff, only words and carriage returns
		};
	},
	props: {
		audio_id: {
			default: "",
		},
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

		regexwithspacedby() {
			return new RegExp(
				`${this.escapeRegex(this.int_spacing.normalize("NFC"))}|(\n)`
			);
		},
		regexwithmultiplespacedby() {
			return new RegExp(`${this.escapeRegex(this.int_spacing)}+`, "g");
		},
	},
	watch: {
		fileloaded: function () {
			this.srtToInterpretation();
		},
	},
	methods: {
		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		upload() {
			this.file = this.$refs.interpretationInput.files[0];
			// console.log(this.file);
			if (this.file != null) {
				let reader = new FileReader();
				reader.addEventListener("load", (event) => {
					this.fileloaded = event.target.result;
				});
				reader.readAsText(this.file);
			}
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
				// console.log(this.int_text.normalize("NFC"))
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
						// console.log(response)
						//add in the association for the new phrase.
						// console.log(this.new_associations)
						fetch(
							process.env.VUE_APP_api_URL +
								"content/" +
								this.audio_id +
								"/" +
								response.interpretation.id,
							{
								method: "POST",
								body: JSON.stringify({
									// text: this.latest_text.normalize('NFC'), // Pass in a string that meets a minimum character fcount and includes all the new tags you want to save
									associations: this.new_associations, // Pass in the list of the new tags
								}),

								headers: {
									"Content-Type": "application/json",

									Authorization: this.$store.state.idToken,
								},
							}
						)
							.then(() => {
								this.$emit("addCreatedInterpretation", response.interpretation);
								this.$emit("closeUploadIntModal");
							})
							// .then((data) => console.log(data))
							.catch((error) => console.error("Error:", error));
						// if the interpretation was created successfully, then tell the parent component to add it to the list of interpretations potentially displayed in the dropdown menu, and tell the Vuex store that we need to add another column to the main screen for viewing the new interpretation

						return;
					})

					.catch((error) => {
						console.error("Error:", error);
					});
			}
		},

		srtToInterpretation() {
			this.timestampsforBackend.length = 0;
			this.offsetsforBackend.length = 0;
			this.captions.length = 0;
			// console.log(this.fileloaded)
			let arrayToParse = this.fileloaded.replaceAll("\r\n","\n").split("\n\n");
			
			
			arrayToParse.forEach((caption) => {
				// console.log(caption)
				let srt_instructions = caption.split("\n");
				// console.log(srt_instructions)
				if (srt_instructions[0] == "") {
					srt_instructions.splice(0, 1);
				}
				let timestampInstructions = srt_instructions[1];

				let timestampStart = timestampInstructions.split(" --> ")[0].trim();
				// console.log(timestampStart)
				let timestampStartMilliseconds = timestampStart.slice(-3);
				// console.log(timestampStartMilliseconds)
				let timestampStartSecondsArray = timestampStart.slice(0, -4).split(":");
				let timestampStartSeconds =
					timestampStartSecondsArray[0] * 3600 +
					timestampStartSecondsArray[1] * 60 +
					timestampStartSecondsArray[2] * 1;
				// console.log(timestampStartSeconds)

				let timestampEnd = timestampInstructions.split(" --> ")[1].trim();
				// console.log(timestampEnd)
				let timestampEndMilliseconds = timestampEnd.slice(-3);
				// console.log(timestampEndMilliseconds)
				let timestampEndSecondsArray = timestampEnd.slice(0, -4).split(":");
				// console.log(timestampEndSecondsArray)
				let timestampEndSeconds =
					timestampEndSecondsArray[0] * 3600 +
					timestampEndSecondsArray[1] * 60 +
					timestampEndSecondsArray[2] * 1;
				// console.log(timestampEndSeconds)

				// only add captions that don't exceed the maximum length of the audio file
				// console.log((1000 * timestampEndSeconds) + " should be less than or equal to " + this.$store.state.audioDuration)
				// console.log((1000*timestampStartSeconds + " should ge greater than or equal to 0"))
				// console.log(srt_instructions[2] + " should not be undefined")
				if (
					1000 * timestampEndSeconds <= this.$store.state.audioDuration &&
					1000 * timestampStartSeconds >= 0 &&
					srt_instructions[2] != undefined
				) {
					let timestampforBackend =
						(100 *
							(Number(
								timestampStartSeconds + "." + timestampStartMilliseconds
							) +
								Number(timestampEndSeconds + "." + timestampEndMilliseconds))) /
						2;
					this.timestampsforBackend.push(timestampforBackend);
					let offsetforBackend =
						(100 *
							(Number(timestampEndSeconds + "." + timestampEndMilliseconds) -
								Number(
									timestampStartSeconds + "." + timestampStartMilliseconds
								))) /
						2;
					this.offsetsforBackend.push(offsetforBackend);
					// console.log(srt_instructions)
					srt_instructions.shift()
					srt_instructions.shift()
					let caption_text=""
					srt_instructions.forEach(part => caption_text = caption_text + "\n" + part)
					caption_text = caption_text.substring(1) + "\n\n";
					this.captions.push(caption_text);
				}
			});

			// console.log(this.captions);
			this.captions.forEach((caption, captionindex) => {
				let tempSplitCaption = caption.split("");
				// console.log(tempSplitCaption)
				tempSplitCaption.forEach((character, index) => {
					if (character == "\\" && tempSplitCaption[index + 1]) {
						if (tempSplitCaption[index + 1] == "n") {
							// console.log("hit")
							tempSplitCaption[index] = "\n";
							tempSplitCaption[index + 1] = "";
						}
					}
				});
				// console.log(tempSplitCaption)
				this.captions[captionindex] = tempSplitCaption.join("");
			});

			this.captions.forEach((caption, captionindex) => {
				// console.log(caption);
				if (this.int_spacing != "") {
					caption = caption.replace(
						this.regexwithmultiplespacedby,
						this.int_spacing
					);

					let tempCaptionArray = caption.split("\n");
					for (let j = 0; j < tempCaptionArray.length; j++) {
						if (tempCaptionArray[j][0] == this.int_spacing) {
							tempCaptionArray[j] = tempCaptionArray[j].substring(1);
						}
						if (
							tempCaptionArray[j][tempCaptionArray[j].length - 1] ==
							this.int_spacing
						) {
							tempCaptionArray[j] = tempCaptionArray[j].substring(
								0,
								tempCaptionArray[j].length - 1
							);
						}
					}

					// console.log(stripped.join("\n"));
					this.captions[captionindex] = tempCaptionArray.join("\n");
				}
				// console.log(this.captions[captionindex]);
			});
			this.int_text_unstripped = this.captions.join("");
			// console.log(this.int_text_unstripped)
			// console.log(this.int_text);
			this.captions_cleaned.length = 0;
			// console.log(this.captions);

			this.captions.forEach((caption) => {
				// console.log(caption)
				let split_text = caption.normalize("NFC").split(this.regexwithspacedby);
				// console.log(split_text.length);
				for (let j = split_text.length; j >= 0; j--) {
					if (split_text[j] === undefined || split_text[j] == "") {
						split_text.splice(j, 1);
					} // second parameter being 1 means remove 1 element only
				}

				if (this.int_spacing.length > 0) {
					// console.log(split_text.length);
					this.captions_cleaned.push(split_text);
				} else if (this.int_spacing.length == 0) {
					let strung_together = split_text.join("");
					// console.log(strung_together);
					this.captions_cleaned.push(strung_together);
				}
			});

			// console.log(this.captions_cleaned);

			// console.log(this.timestampsforBackend);

			let wordindexcount = 0;
			this.captions_cleaned.forEach((caption, captionindex) => {
				for (let j = 0; j < caption.length; j++) {
					if (caption[j] != "\n") {
						this.new_associations[wordindexcount] = {};
						this.new_associations[wordindexcount][
							Math.round(this.timestampsforBackend[captionindex])
						] = Math.round(this.offsetsforBackend[captionindex]);
					}

					wordindexcount++;
				}
			});

			this.create();
		},

		closeModal() {
			this.$emit("closeUploadIntModal");
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
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;
}

.modal::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}
</style>