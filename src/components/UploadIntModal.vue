<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop">
		<div
			class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button class="mx-4 my-[1vh] text-xl text-gray-500" @click.prevent="closeModal()">
				×
			</button>
			<h1 class="text-2xl font-bold mb-[1vh]">Upload Interpretation File</h1>
			<br />
			<input class="w-full px-3 py-[1vh] mb-[2vh] border border-gray-300 rounded" type="file" accept=".srt, .txt, .eaf"
				ref="interpretationInput" />
			<select v-model="filetype" class="w-full px-3 py-[1vh] mb-[1vh] border border-gray-300 rounded"
				:class="{ 'text-gray-500': isActive }">
				<option value="">What file format are you uploading?</option>
				<option value="srt" class="text-black">SubRip (.srt)</option>
				<option value="eaf" class="text-black">ELAN Annotation Format (.eaf)</option>
				<option value="tsv" class="text-black">Audacity Timing File (.txt)</option>
			</select>
			<input class="w-full px-3 py-[1vh] border border-gray-300 rounded" placeholder="Title of New Interpretation"
				v-model="int_title" />
			<input class="w-full px-3 py-[1vh] border border-gray-300 rounded" placeholder="Language of New Interpretation"
				v-model="int_language" />
			<input class="w-full px-3 py-[1vh] border border-gray-300 rounded"
				placeholder="What character is this language 'spaced' by? (or leave blank)" v-model="int_spacing"
				maxlength="1" />
			<br>

			<button
				class="w-full px-3 py-2 mt-[2vh] text-sm font-medium text-white transition-colors border rounded bg-cyan-700 border-cyan-600 hover:bg-cyan-600"
				@click="upload">
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
			filetype: "",
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
		//decides whether the file format selection should be grayed out or black
		isActive() {
			if (this.filetype == "") { return true }
			else { return false }
		},

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
			if (this.fileloaded == "") { }
			else if (this.filetype == "srt") {
				try {
					this.srtToInterpretation();
				}
				catch (error) {
					console.log(error)
					alert("not a readable SubRip file; select a different filetype")
				}
			}
			else if (this.filetype == "eaf") {
				try { this.eafToInterpretation() }
				catch (error) {
					console.log(error)
					alert("not a readable ELAN Annotation Format file; select a different filetype")
				}
			}
			else if (this.filetype == "tsv") {
				try { this.tsvToInterpretation() }
				catch (error) {
					console.log(error)
					alert("not a readable Audacity Timing File; select a different filetype")
				}
			}
			else {
				alert("file type not selected")
			}
		},
	},
	methods: {
		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		upload() {
			this.fileloaded = ""
			this.file = this.$refs.interpretationInput.files[0];
			// console.log(this.file);
			if (this.file != null) {
				let reader = new FileReader();
				reader.addEventListener("load", (event) => {

					this.fileloaded = event.target.result.trim();
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
			// console.log(this.int_text.normalize("NFC"))
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

		async srtToInterpretation() {

			this.timestampsforBackend.length = 0;
			this.offsetsforBackend.length = 0;
			this.captions.length = 0;
			await this.srtToInterpretationHelper()
			this.prepText()
		},

		async tsvToInterpretation() {

			this.timestampsforBackend.length = 0;
			this.offsetsforBackend.length = 0;
			this.captions.length = 0;
			await this.tsvToInterpretationHelper()
			this.prepText()
		},

		async eafToInterpretation() {
			this.timestampsforBackend.length = 0;
			this.offsetsforBackend.length = 0;
			this.captions.length = 0;
			await this.eafToInterpretationHelper()
			this.prepText()
		},

		async eafToInterpretationHelper() {
			console.log(this.fileloaded)
			debugger
		},

		async srtToInterpretationHelper() {
			let arrayToParse = this.fileloaded.replaceAll("\r\n", "\n").split("\n\n");

			for (let j = arrayToParse.length - 1; j >= 0; j--) {
				if (arrayToParse[j] == "") {
					arrayToParse.splice(j, 1);
				}

			}

			let lastEndSeconds = 0;

			for (let h = 0; h < arrayToParse.length; h++) {

				let srt_instructions = arrayToParse[h].trim().split("\n");

				let timestampInstructions = srt_instructions[1];

				let timestampStart = timestampInstructions.split(" --> ")[0].trim();
				let timestampStartMilliseconds = timestampStart.slice(-3);
				let timestampStartSecondsArray = timestampStart.slice(0, -4).split(":");
				let timestampStartSeconds =
					timestampStartSecondsArray[0] * 3600 +
					timestampStartSecondsArray[1] * 60 +
					timestampStartSecondsArray[2] * 1;
				let timestampStartReformatted = Number(timestampStartSeconds + "." + timestampStartMilliseconds)

				let timestampEnd = timestampInstructions.split(" --> ")[1].trim();
				let timestampEndMilliseconds = timestampEnd.slice(-3);
				let timestampEndSecondsArray = timestampEnd.slice(0, -4).split(":");
				let timestampEndSeconds =
					timestampEndSecondsArray[0] * 3600 +
					timestampEndSecondsArray[1] * 60 +
					timestampEndSecondsArray[2] * 1;
				let timestampEndReformatted = Number(timestampEndSeconds + "." + timestampEndMilliseconds)


				lastEndSeconds = await this.formatForBackend(timestampStartReformatted, timestampEndReformatted, srt_instructions, lastEndSeconds)
			}


		},

		async tsvToInterpretationHelper() {
			let arrayToParse = this.fileloaded.replaceAll("\r\n", "\n").split("\n");

			for (let j = arrayToParse.length - 1; j >= 0; j--) {
				if (arrayToParse[j] == "") {
					arrayToParse.splice(j, 1);
				}
			}

			let lastEndSeconds = 0;
			for (let h = 0; h < arrayToParse.length; h++) {
				let srt_instructions = arrayToParse[h].trim().split("\t");
				let timestampStartReformatted = Number(srt_instructions[0])
				let timestampEndReformatted = Number(srt_instructions[1])
				lastEndSeconds = await this.formatForBackend(timestampStartReformatted, timestampEndReformatted, srt_instructions, lastEndSeconds)
			}

		},

		formatForBackend(timestampStart, timestampEnd, srt_instructions, lastEndSeconds) {
			// only add captions that don't exceed the maximum length of the audio file
			// console.log((1000 * timestampEnd) + " should be less than or equal to " + this.$store.state.audioDuration)
			// console.log((1000*timestampStart + " should ge greater than or equal to 0"))
			// console.log(srt_instructions[2] + " should not be undefined")
			if (
				1000 * timestampEnd <= this.$store.state.audioDuration &&
				1000 * timestampStart >= 0 &&
				srt_instructions[2] != undefined
			) {
				let timestampforBackend =
					(100 *
						(timestampStart +
							timestampEnd)) /
					2;
				this.timestampsforBackend.push(timestampforBackend);
				let offsetforBackend =
					(100 *
						(timestampEnd -
							timestampStart)) /
					2;
				this.offsetsforBackend.push(offsetforBackend);
				srt_instructions.shift();
				srt_instructions.shift();
				let caption_text = "";
				srt_instructions.forEach(
					// this is for if the caption takes up more than one line in the text file
					(part) => (caption_text = caption_text + "\n" + part)
				);

				console.log((100 * timestampStart) + " should be greater than " + lastEndSeconds)

				if (
					100 *
					timestampStart >
					lastEndSeconds
				) {
					caption_text = "\n\n" + caption_text.substring(1);
					this.captions.push(caption_text);
				} else {
					caption_text = caption_text.substring(1);
					this.captions.push(caption_text);
				}
				lastEndSeconds =
					100 * timestampEnd;
				return lastEndSeconds
			} else { return lastEndSeconds }
		},

		prepText() {

			if (this.captions[0][0] == "\n" && this.captions[0][1] == "\n") {
				// take away the first two carriage returns from before the first caption
				// console.log("HIT")
				// console.log(this.captions[0])
				this.captions[0] = this.captions[0].slice(2);
				// console.log(this.captions[0])
			}

			// console.log(this.captions);
			// for (let a=0; a < this.captions.length; a++)
			// {
			// 	if (this.captions[a].substring(0,4) != "\n\n") {
			// 		console.log("HIT")
			// 		this.captions[a] = this.int_spacing + this.captions[a]
			// 	}
			// }
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

			for (let b = 1; b < this.captions.length; b++) {
				// ignore the first caption because we don't want to put a spacing character in front of that one
				if (this.captions[b][0] != "\n" || this.captions[b][1] != "\n") {
					this.captions[b] = this.int_spacing + this.captions[b];
				}
			}
			this.int_text_unstripped = this.captions.join("");
			// console.log(this.int_text_unstripped);
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

			// console.log(this.new_associations);

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