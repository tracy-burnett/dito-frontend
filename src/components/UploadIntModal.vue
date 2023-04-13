<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop">
		<div
			class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button class="mx-4 my-[1vh] text-xl text-gray-500" @click.prevent="closeModal()">
				×
			</button>
			<h1 class="text-2xl font-bold mb-[1vh]">Upload Interpretation File</h1>
			<br />
			<input class="w-full px-3 py-[1vh] mb-[2vh] border border-gray-300 rounded" type="file"
				accept=".srt, .txt, .eaf" ref="interpretationInput" />
			<select v-model="filetype" class="w-full px-3 py-[1vh] mb-[1vh] border border-gray-300 rounded"
				:class="{ 'text-gray-500': isActive }">
				<option value="">What file format are you uploading?</option>
				<option value="srt" class="text-black">SubRip (.srt)</option>
				<option value="eaf" class="text-black">ELAN Annotation Format (.eaf)</option>
				<option value="tsv" class="text-black">Audacity Timing File (.txt)</option>
			</select>
			<input v-if="filetype != 'eaf'" class="w-full px-3 py-[1vh] border border-gray-300 rounded"
				placeholder="Title of New Interpretation" v-model="int_title" />
			<input v-if="filetype != 'eaf'" class="w-full px-3 py-[1vh] border border-gray-300 rounded"
				placeholder="Language of New Interpretation" v-model="int_language" />
			<input v-if="filetype != 'eaf'" class="w-full px-3 py-[1vh] border border-gray-300 rounded"
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
			int_text: "",
			int_language: "",
			fileloaded: "",
			filetype: "",
			int_spacing: "",
			file: null,
			timestamps: {},
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
		filetype: function () {
			if (this.filetype == "eaf") {
				this.int_language = ""
				this.int_title = ""
				this.int_spacing = ""
			}
		},

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

		getIntText() {
			if (this.int_spacing != "") {
				let stripped = this.int_text_unstripped.replace(
					this.regexwithmultiplespacedby,
					this.int_spacing
				);
				this.int_text = stripped;
			} else if (this.int_spacing == "") {
				this.int_text = this.int_text_unstripped;
			}
		},

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
				// console.log(this.int_title.normalize("NFC"))
				// console.log(this.int_text.normalize("NFC"))
				// console.log(this.int_language.normalize("NFC"))
				// console.log(this.int_spacing.normalize("NFC"))

				let response = await fetch(
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

						return response

					})

					.catch((error) => {
						console.error("Error:", error);
					});


				await fetch(
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
			for (var member in this.timestamps) delete this.timestamps[member]

			let xmlDoc = new DOMParser().parseFromString(this.fileloaded, "text/xml")

			// console.log(xmlDoc)


			let time_unit = xmlDoc.querySelector("HEADER").getAttribute('TIME_UNITS')
			if (time_unit != "milliseconds") { throw new Error('Dito can only upload .eaf files with timestamps calculated in milliseconds at this time.') }
			this.timestamps = {}
			let timeslots = xmlDoc.querySelector("TIME_ORDER").querySelectorAll("TIME_SLOT")

			// console.log(timeslots)

			for (let a = 0; a < timeslots.length; a++) {
				this.timestamps[timeslots[a].getAttribute("TIME_SLOT_ID")] = timeslots[a].getAttribute("TIME_VALUE")
			}

			// console.log(this.timestamps)

			let eafObject = await this.eafToInterpretationHelper(xmlDoc)
			console.log(eafObject)


			let arrayOfTierNames = Object.keys(eafObject)


			for (let m = 0; m < arrayOfTierNames.length; m++) {

				this.timestampsforBackend.length = 0;
				this.offsetsforBackend.length = 0;
				this.captions.length = 0;

				// console.log(this.int_text_unstripped)
				this.int_title = arrayOfTierNames[m]
				console.log(this.int_title)
				this.int_spacing = " "
				this.int_text_unstripped = ""
				this.getIntText()
				// console.log(this.int_text_unstripped)
				// console.log(this.int_text)
				this.int_language = ""
				let arrayToParse = Object.entries(eafObject[arrayOfTierNames[m]])
				console.log(arrayToParse)

				for (let j = arrayToParse.length - 1; j >= 0; j--) {
					if (arrayToParse[j][1]["annotationText"] == "") {
						arrayToParse.splice(j, 1);
					}
				}
				console.log(arrayToParse)

				let lastEndSeconds = 0;
				for (let h = 0; h < arrayToParse.length; h++) {
					let srt_instructions = arrayToParse[h][1]["annotationText"]
					// console.log(srt_instructions)

					let timestampStartReformatted = 0
					let timestampEndReformatted = 0
					if (arrayToParse[h][1]["annotationType"] == "alignable") {
						timestampStartReformatted = Number(this.timestamps[arrayToParse[h][1]["timeslotRef1"]]) / 1000
						timestampEndReformatted = Number(this.timestamps[arrayToParse[h][1]["timeslotRef2"]]) / 1000
						// console.log(timestampStartReformatted)
						// console.log(timestampEndReformatted)
					}
					else if (arrayToParse[h][1]["annotationType"] == "ref") {
						timestampStartReformatted = Number(this.timestamps[eafObject[arrayToParse[h][1]["parentRef"]][arrayToParse[h][1]["annotationRef"]]["timeslotRef1"]]) / 1000
						timestampEndReformatted = Number(this.timestamps[eafObject[arrayToParse[h][1]["parentRef"]][arrayToParse[h][1]["annotationRef"]]["timeslotRef2"]]) / 1000
					}
					lastEndSeconds = await this.formatForBackend(timestampStartReformatted, timestampEndReformatted, srt_instructions, lastEndSeconds)

				}
				await this.prepText()
			}




		},

		async eafToInterpretationHelper(xmlDoc) {
			// console.log(this.fileloaded)



			let tiers = xmlDoc.querySelectorAll("TIER")

			let newInterpretations = {}

			tiers.forEach(tier => {
				let parentRef = tier.getAttribute("PARENT_REF")
				// let annotationType = tier
				// console.log(tier.querySelector("ANNOTATION").firstElementChild.tagName)
				// console.log(parentRef)
				newInterpretations[tier.getAttribute("TIER_ID")] = {}
				if (tier.querySelector("ANNOTATION") && tier.querySelector("ANNOTATION").firstElementChild.tagName == "ALIGNABLE_ANNOTATION") {
					tier.querySelectorAll("ANNOTATION").forEach(annotation => {
						let child = annotation.firstElementChild
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")] = {}
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].annotationType = "alignable"
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].timeslotRef1 = child.getAttribute("TIME_SLOT_REF1")
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].timeslotRef2 = child.getAttribute("TIME_SLOT_REF2")
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].annotationText = child.firstElementChild.textContent

						// console.log("alignable: " + annotationId + "; " + timeslotRef1 + "; " + timeslotRef2 + "; " + annotationText)
					})
				} else if (tier.querySelector("ANNOTATION") && tier.querySelector("ANNOTATION").firstElementChild.tagName == "REF_ANNOTATION") {
					// newInterpretations[tier.getAttribute("TIER_ID")].forEach(annotation => {
					tier.querySelectorAll("ANNOTATION").forEach(annotation => {
						let child = annotation.firstElementChild
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")] = {}
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].parentRef = parentRef
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].annotationType = "ref"
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].annotationRef = child.getAttribute("ANNOTATION_REF")
						newInterpretations[tier.getAttribute("TIER_ID")][child.getAttribute("ANNOTATION_ID")].annotationText = child.firstElementChild.textContent

						// console.log("ref: " + annotationId + "; " + parentRef + "; " + annotationRef + "; " + annotationText)
					})


				}

			}
			)
			return newInterpretations



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
				srt_instructions.shift();
				srt_instructions.shift();

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
				srt_instructions.shift();
				srt_instructions.shift();
				let timestampStartReformatted = Number(srt_instructions[0])
				let timestampEndReformatted = Number(srt_instructions[1])
				lastEndSeconds = await this.formatForBackend(timestampStartReformatted, timestampEndReformatted, srt_instructions, lastEndSeconds)
			}

		},

		formatForBackend(timestampStart, timestampEnd, srt_instructions, lastEndSeconds) {
			// only add captions that don't exceed the maximum length of the audio file

			if (
				1000 * timestampEnd <= this.$store.state.audioDuration &&
				1000 * timestampStart >= 0 &&
				srt_instructions != undefined
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
				let caption_text = "";
				if (Array.isArray(srt_instructions)) {
					srt_instructions.forEach(
						// this is for if the caption takes up more than one line in the text file
						(part) => (caption_text = caption_text + "\n" + part)
					);
				} else { caption_text = "\n" + srt_instructions }

				// console.log((100 * timestampStart) + " should be greater than " + lastEndSeconds)
				// console.log(caption_text)

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
			} else {
				console.log((1000 * timestampEnd) + " should be less than or equal to " + this.$store.state.audioDuration)
				console.log((1000 * timestampStart + " should be greater than or equal to 0"))
				console.log(srt_instructions + " should not be undefined")
				return lastEndSeconds
			}
		},

		async prepText() {
			// console.log(...this.captions)
			if (this.captions.length>1 && this.captions[0][0] == "\n" && this.captions[0][1] == "\n") {
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
			this.getIntText()
			// console.log(this.int_text_unstripped);
			// console.log(this.int_text);
			this.captions_cleaned.length = 0;
			
			for (var member in this.new_associations) delete this.new_associations[member]
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
			// console.log(this.captions_cleaned)
			this.captions_cleaned.forEach((caption, captionindex) => {
				for (let j = 0; j < caption.length; j++) {
					if (caption[j] != "\n") {
						// console.log(caption[j])
						this.new_associations[wordindexcount] = {};
						this.new_associations[wordindexcount][
							Math.round(this.timestampsforBackend[captionindex])
						] = Math.round(this.offsetsforBackend[captionindex]);
					}

					wordindexcount++;
				}
			});

			// console.log(this.new_associations);

			await this.create();
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