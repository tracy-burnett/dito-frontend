<template>
	<slot></slot>
	<div class="flex-auto">

		<span class="py-1 font-bold border-gray-300 rounded">{{ title }}</span>
		in <span class="py-1 border-gray-300 rounded ">{{ language_name }}</span><br /><br />

		<textarea class="w-full h-full px-3 py-1  mt-[2vh] border-gray-300 rounded prompter"
			:style="{ 'font-size': fontsize + 'px' }" style="overflow: scroll; height:45.5vh;"
			placeholder="enter new text here" v-model="new_text_unstripped" ref="promptertextarea"
			@keydown.enter.exact.prevent="emitNewPrompt()"
			@keydown.enter.shift.exact.prevent="new_text_unstripped += '\n'"></textarea>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	inheritAttrs: false,
	name: "Prompter",
	data: () => {
		return {
			new_text_unstripped: "",
			language_name: "",
			title: "",
			latest_text: "",
			original_text: "",
			spaced_by: "",
			manuallyDraggedEndTimeMemory: 0,
			new_associations: {},
			tempcurrentgapstart: 0,
			tempcurrentgapend: 0,
			associations: null,
			associationGaps: [],
			newPromptorScribingToggle: false, // when New Prompt is clicked, this becomes false.  When scribing changes, this becomes true.
			usableGaps: [],
			relevantGap: {},
			// allowSubmit: false,
			usablePeaksData: [],
			contentStartingIndex: null,
			contentEndingIndex: null,
			sensitivity: 0.05,
			recursionStopper: false,
			// recursionTracker: 0,
			nomoregaps: false, // will be true if no scriber regions exist
			onemoregap: false,
			tempeditingversion: 0,
		};
	},
	computed: {
		// split by carriage returns and get rid of any spaced_by characters at the beginning and end of each element
		new_text() {
			if (this.spaced_by != "") {
				let stripped = this.new_text_intermediary.split("\n");
				for (let j = 0; j < stripped.length; j++) {
					if (stripped[j][0] == this.spaced_by) {
						stripped[j] = stripped[j].substring(1);
					}
					if (stripped[j][stripped[j].length - 1] == this.spaced_by) {
						stripped[j] = stripped[j].substring(0, stripped[j].length - 1);
					}
				}

				// console.log(stripped.join("\n"));
				return stripped.join("\n");
			} else if (this.spaced_by == "") {
				return this.new_text_intermediary;
			}
		},

		// gets rid of streaks of spaced_by characters; replaces them with a single spaced_by character
		new_text_intermediary() {
			if (this.spaced_by != "") {
				let stripped = this.new_text_unstripped.replace(
					this.regexwithmultiplespacedby,
					this.spaced_by
				);
				return stripped;
			} else if (this.spaced_by == "") {
				return this.new_text_unstripped;
			}
		},

		scribingclean() {
			if (
				this.$store.state.audioDuration / 10 < this.scribing &&
				this.$store.state.audioDuration > 0
			) {
				return this.$store.state.audioDuration / 10;
			} else {
				return this.scribing;
			}
		},

		regexwithspacedby() {
			return new RegExp(`${this.escapeRegex(this.spaced_by)}|(\n)`);
		},

		regexwithmultiplespacedby() {
			return new RegExp(`${this.escapeRegex(this.spaced_by)}+`, "ug");
		},

		original_text_cleaned() {
			let split_text = this.original_text.split(this.regexwithspacedby);

			for (let j = split_text.length; j >= 0; j--) {
				if (split_text[j] === undefined || split_text[j] == "") {
					split_text.splice(j, 1);
				} // second parameter being 1 means remove 1 element only
			}

			if (this.spaced_by.length > 0) {
				return split_text;
			} else if (this.spaced_by.length == 0) {
				let strung_together = split_text.join("");
				return strung_together;
			}
		},

		latest_text_cleaned() {
			let split_text = this.latest_text
				.normalize("NFC")
				.split(this.regexwithspacedby);

			for (let j = split_text.length; j >= 0; j--) {
				if (split_text[j] === undefined || split_text[j] == "") {
					split_text.splice(j, 1);
				} // second parameter being 1 means remove 1 element only
			}

			if (this.spaced_by.length > 0) {
				return split_text;
			} else if (this.spaced_by.length == 0) {
				let strung_together = split_text.join("");
				return strung_together;
			}
		},

		numbernewlines() {
			return this.latest_text.split(/\r\n|\r|\n/).length;
		},
	},
	props: {
		// ID of associated audio file
		audio_id: {
			default: "",
		},
		scribing: {
			default: 1250,
		},
		newPromptscounter: {
			default: 0,
		},
		resetSensitivitycounter: {
			default: 0,
		},

		fontsize: { default: 12 },

		// ID of interpretation displayed in this Editor
		interpretation_id: { default: "" },

		// whether the interpretation is owned "owner", editable "editor", or only viewable "viewer" by the logged-in user
		interpretationStatus: { default: "" },

		editingversion: { default: 0 },
	},
	watch: {
		// nomoregaps: function() {
		// if (this.nomoregaps==false) {

		// this.$emit("yesGaps");
		// }
		// else if (this.nomoregaps==true) {

		// this.$emit("noGaps");
		// }
		// },

		scribingclean: function () {
			this.nomoregaps = false;
			if (this.newPromptorScribingToggle == false) {
				this.tempcurrentgapstart = this.relevantGap.startTime;
			}
			this.newPromptorScribingToggle = true;
			this.findGaps();
		},
		resetSensitivitycounter: function () {
			this.sensitivity = .05

		},
		newPromptscounter: function () {
			// this.sensitivity=.05
			this.newPromptorScribingToggle = false;
			if (
				this.new_text != "" &&
				this.$store.state.audioDuration > 0 &&
				this.associationGaps.length > 0
			) {
				// this.newpromptsfunc will be called if submit is successful inside updatetext()
				this.updateText();
			}
			if (this.new_text == "") {
				this.newPromptsfunc();
			}
		},
		"$store.state.peaksData": function () {
			this.tempcurrentgapend = this.$store.state.audioDuration / 10;
			this.findGaps(); // populates "this.usableGaps"
		},
		// "$store.state.startTimePrompter": function () {
		// 	if (
		// 		!(
		// 			this.$store.state.startTimePrompter * 100 >=
		// 				this.relevantGap.startTime &&
		// 			this.$store.state.endTimePrompter * 100 <=
		// 				Math.min(this.usableGaps[0].endTime, this.tempcurrentgapend)
		// 		)
		// 	) {
		// 		this.allowSubmit = false;
		// 	} else {
		// 		this.allowSubmit = true;
		// 	}
		// },
		"$store.state.endTimePrompter": function () {
			if (
				this.$store.state.startTimePrompter * 100 >=
				this.relevantGap.startTime &&
				this.$store.state.endTimePrompter * 100 <=
				Math.min(this.usableGaps[0].endTime, this.tempcurrentgapend) // GAPS NOT POPULATED YET
			) {
				//  {
				// 	this.allowSubmit = false;
				// } else
				// GAPS POPULATED
				// Math.min(this.usableGaps[0].endTime, this.tempcurrentgapend) will be the end of the current gap that's being worked with
				// this.allowSubmit = true;
				// if the end of the region is dragged lower than approximately the original end of the gap, then adjust the end of the
				// original gap specs to reflect that, and if we are still chunking out of the same usableGap, then adjust the startTime of that too.
				if (
					this.$store.state.endTimePrompter * 100 <
					Math.min(this.usableGaps[0].endTime, this.tempcurrentgapend) + 5
				) {
					this.relevantGap.endTime = this.$store.state.endTimePrompter * 100;
					if (
						this.usableGaps[0].startCharacter == this.relevantGap.startCharacter
					) {
						this.usableGaps[0].startTime =
							this.$store.state.endTimePrompter * 100 - 5;
					}
					// if the end of the region is dragged HIGHER than approximately the start of the next gap-to-be, then
					// adjust the start of the next gap-to-be to reflect that
					// } else if (
					// 	this.$store.state.endTimePrompter * 100 >
					// 	this.usableGaps[0].startTime + 5
					// ) {
					// 	this.usableGaps[0].startTime =
					// 		this.$store.state.endTimePrompter * 100 - 5;
				}
			}
		},
		"$store.state.triggerNewText": function () {
			this.new_text_unstripped = "";
		},
	},
	methods: {
		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		findGaps: function () {
			if (this.$store.state.audioDuration > 0) {
				this.associationGaps.length = 0;
				this.usableGaps.length = 0;
				this.relevantGap = {};
				if (Object.keys(this.associations).length > 0) {
					//start
					let startTime = 0;
					let endTime = Object.keys(this.associations)[0].split("-")[0];

					let intervalsCount = Object.values(this.associations)[0].length;

					//all character intervals to be highlighted
					let endCharacterArray = [];
					for (let j = 0; j < intervalsCount; j++) {
						//get largest character number from association i to be the startChar for the gap
						endCharacterArray.push(
							Object.values(this.associations)[0][j].split("-")[0]
						);
					}
					let endCharacter = endCharacterArray.reduce(function (a, b) {
						return Math.min(a, b);
					}, Infinity);

					let associationsObject = {};
					associationsObject.startTime = startTime;
					associationsObject.endTime = endTime;

					associationsObject.startCharacter = 0;
					associationsObject.endCharacter = endCharacter;
					// console.log(associationsObject)
					if (
						parseInt(associationsObject.endTime) >=
						parseInt(associationsObject.startTime)
						//  &&
						// (associationsObject.endCharacter >=
						// 	associationsObject.startCharacter ||
						// 	associationsObject.endCharacter == null)
					) {
						this.associationGaps.push(associationsObject);
					}

					//all bounded gaps
					for (let i = 0; i < Object.keys(this.associations).length - 1; i++) {
						startTime = Object.keys(this.associations)[i].split("-")[1];
						endTime = Object.keys(this.associations)[i + 1].split("-")[0];
						intervalsCount = Object.values(this.associations)[i].length;

						//all character intervals to be highlighted
						let startCharacterArray = [];
						for (let j = 0; j < intervalsCount; j++) {
							//get largest character number from association i to be the startChar for the gap
							startCharacterArray.push(
								Object.values(this.associations)[i][j].split("-")[1]
							);
						}
						let startCharacter = startCharacterArray.reduce(function (a, b) {
							return Math.max(a, b);
						}, -Infinity);

						endCharacterArray = [];
						for (let j = 0; j < intervalsCount; j++) {
							//get smallest character number from association i+1 to be the endChar for the gap
							endCharacterArray.push(
								Object.values(this.associations)[i + 1][j].split("-")[0]
							);
						}
						// console.log(endCharacterArray);
						endCharacter = endCharacterArray.reduce(function (a, b) {
							return Math.min(a, b);
						}, Infinity);

						associationsObject = {};
						associationsObject.startTime = startTime;
						associationsObject.endTime = endTime;
						associationsObject.startCharacter = startCharacter;
						associationsObject.endCharacter = endCharacter;

						if (
							parseInt(associationsObject.endTime) >=
							parseInt(associationsObject.startTime)
							//  &&
							// (associationsObject.endCharacter >=
							// 	associationsObject.startCharacter ||
							// 	associationsObject.endCharacter == null)
						) {
							this.associationGaps.push(associationsObject);
						}
					}

					if (
						this.associationGaps[this.associationGaps.length - 1].endTime <
						Math.floor(this.$store.state.audioDuration / 10)
					) {
						//final
						startTime = Object.keys(this.associations)[
							Object.keys(this.associations).length - 1
						].split("-")[1];
						endTime = this.$store.state.audioDuration / 10;

						intervalsCount = Object.values(this.associations)[
							Object.keys(this.associations).length - 1
						].length;

						//all character intervals to be highlighted
						let startCharacterArray = [];
						for (let j = 0; j < intervalsCount; j++) {
							//get largest character number from association i to be the startChar for the gap
							startCharacterArray.push(
								Object.values(this.associations)[
									Object.keys(this.associations).length - 1
								][j].split("-")[1]
							);
						}
						let startCharacter = startCharacterArray.reduce(function (a, b) {
							return Math.max(a, b);
						}, -Infinity);

						associationsObject = {};
						associationsObject.startTime = startTime;
						associationsObject.endTime = endTime;

						associationsObject.startCharacter = startCharacter;
						associationsObject.endCharacter = null;
						if (
							parseInt(associationsObject.endTime) >=
							parseInt(associationsObject.startTime)
							// &&
							// (associationsObject.endCharacter >=
							// 	associationsObject.startCharacter ||
							// 	associationsObject.endCharacter == null)
						) {
							this.associationGaps.push(associationsObject);
						}
					}

					this.associationGaps.forEach((element) => {
						if (
							element.endTime - element.startTime > 200 && // FLAG TIME DECISION
							this.tempcurrentgapstart < element.endTime - 200
						) {
							if (element.startTime >= this.tempcurrentgapstart) {
								this.usableGaps.push(element);
							} else if (element.startTime < this.tempcurrentgapstart) {
								element.startTime = this.tempcurrentgapstart;
								this.usableGaps.push(element);
							}
						}
					});
				} else {
					let associationsObject = {};
					associationsObject.startTime = this.tempcurrentgapstart;
					associationsObject.endTime = this.$store.state.audioDuration / 10;

					associationsObject.startCharacter = 0;
					associationsObject.endCharacter = null;
					if (
						parseInt(associationsObject.endTime) >=
						parseInt(associationsObject.startTime)
						//  &&
						// (associationsObject.endCharacter >=
						// 	associationsObject.startCharacter ||
						// 	associationsObject.endCharacter == null)
					) {
						this.associationGaps.push(associationsObject);
					}

					if (
						this.tempcurrentgapstart <
						this.associationGaps[0].endTime - 200
						|| this.onemoregap==true || this.nomoregaps == true
					) {
						// FLAG TIME DECISION
						this.usableGaps.push(this.associationGaps[0]);
					}
				}

				this.newPromptsfunc();
			}
		},

		newPromptsfunc() {
			if (this.newPromptorScribingToggle == true) {
				this.relevantGap.startTime = this.tempcurrentgapstart; // this ensures that as the user drags the scribing toggle left and right, the relevant gap is always calculated based on the baseline starttime for the gap and starttime doesn't only increase (instead, it gets reset)
			}
			this.new_text_unstripped = ""; // delete text previously typed by the user
			// console.log("sensitivity " + this.sensitivity);
			this.contentEndingIndex = 0;
			this.contentStartingIndex = 0;

			//if the audio player has loaded, and the gaps have been identified
			// console.log("no more gaps? " + this.nomoregaps)
			if (
				this.$store.state.audioDuration > 0 &&
				this.usableGaps.length > 0 &&
				this.nomoregaps == false && this.onemoregap == false
			) {
				// console.log("inside IF statement")
				// a little gap to work with to generate this prompt
				this.relevantGap.startTime = parseInt(this.usableGaps[0].startTime); // should be in hundredths of a second
				this.relevantGap.endTime = Math.min(
					parseInt(this.usableGaps[0].startTime) +
					parseInt(this.scribingclean) +
					100,
					parseInt(this.usableGaps[0].endTime)
				); // should be in hundredths of a second               // FLAG ARBITRARY TIME DECISION
				this.relevantGap.startCharacter = parseInt(
					this.usableGaps[0].startCharacter
				);
				this.relevantGap.endCharacter = parseInt(
					this.usableGaps[0].endCharacter
				);
				// this.usablePeaksData=[1 , 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0]
				// get information about the waveform for the little gap we are currently working with and map it to 1's and 0's depending on a preset sensitivity level
				this.usablePeaksData = this.$store.state.peaksData
					.slice(this.relevantGap.startTime, this.relevantGap.endTime)
					.map((e) => Math.round(e * 1000) / 10)
					.map((e) => {
						if (Math.abs(e) > this.sensitivity) {
							return 1;
						} else {
							return 0;
						}
					});

				// find the largest set of content within the currently selected portion of audio that has a silence-ish gap on either side
				let greenlight = false;
				let priorvalue = null;
				for (let i = 0; i < this.usablePeaksData.length; i++) {
					if (
						this.usablePeaksData[i] == 1
						// &&
						// (priorvalue <= 0 || priorvalue == null)
					) {
						priorvalue = 1;
					} else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 1 &&
						priorvalue < 3 &&
						greenlight == true
					) {
						priorvalue++;
					} else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 3 &&
						greenlight == true
					) {
						this.contentStartingIndex = i - 7;
						break;
					} else if (
						this.usablePeaksData[i] == 0 &&
						(priorvalue == null || priorvalue > 0)
					) {
						priorvalue = 0;
					}
					//if we are in the middle of silence?
					else if (
						this.usablePeaksData[i] == 0 &&
						priorvalue > -1 &&
						priorvalue <= 0
					) {
						priorvalue--;
					}
					//if we are in the middle of silence
					else if (this.usablePeaksData[i] == 0 && priorvalue <= -1) {
						priorvalue = 0;
						greenlight = true;
					}
					// console.log(priorvalue);
				}
				priorvalue = null;
				greenlight = false;

				for (let i = this.usablePeaksData.length - 1; i >= 0; i--) {
					//if we are just starting a streak of 1's
					if (
						this.usablePeaksData[i] == 1 
						&&
						(priorvalue <= 0 || priorvalue == null)
					) {
						priorvalue = 1;
					}

					//if we are in the middle of a streak of 1's and we are allowed to start searching for content
					else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 1 &&
						priorvalue < 3 &&
						greenlight == true
					) {
						priorvalue++;
					}

					//if we have met our streak quota of content
					else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 3 &&
						greenlight == true
					) {
						this.contentEndingIndex = i + 5;
						break;
					}

					//if silence is just starting
					else if (
						this.usablePeaksData[i] == 0 &&
						(priorvalue == null || priorvalue > 0)
					) {
						priorvalue = 0;
					}
					//if we are in the middle of silence
					else if (
						this.usablePeaksData[i] == 0 &&
						priorvalue > -1 &&
						priorvalue <= 0
					) {
						priorvalue--;
					}
					//if we are in the middle of silence
					else if (this.usablePeaksData[i] == 0 && priorvalue <= -1) {
						priorvalue = 0;
						greenlight = true;
					}
					// console.log(priorvalue);
				}

				// if there's still a lot of time left in usable portion of audio we are currently working with, like a lot meaning enough that there could be another relevant segment in it, then keep considering it... otherwise, move to the next portion
				if (
					this.usableGaps[0].endTime -
					(this.contentEndingIndex + this.relevantGap.startTime - 5) >=
					this.scribingclean && // FLAG TIME DECISION fyi when the user sets this value too low it can prevent them from annotating some parts of the audio because it ignores them because if it is sensitive enough to detect them then the gap is too big for the user to annotate based on the length of phrase that they say they prefer to annotate.
					this.contentEndingIndex >= 5
				) {
					this.usableGaps[0].startTime =
						this.contentEndingIndex - 5 + this.relevantGap.startTime;
					this.tempcurrentgapend = this.$store.state.audioDuration / 10;
				} else if (
					this.usableGaps[0].endTime -
					(this.contentEndingIndex - 5 + this.relevantGap.startTime) <
					this.scribingclean && // FLAG TIME DECISION
					this.usableGaps.length >= 2
				) {
					this.tempcurrentgapend = this.usableGaps[0].endTime;
					this.usableGaps.shift();
				} else if (
					this.usableGaps[0].endTime -
					(this.contentEndingIndex - 5 + this.relevantGap.startTime) <
					this.scribingclean && // FLAG TIME DECISION
					this.usableGaps.length <= 1
				) {
					// console.log("help")
					// this.findGaps()
					// only the tail end of the gap remains, so use it.
					this.onemoregap = true;
				}

				// console.log(this.contentStartingIndex + this.relevantGap.startTime);
				// console.log(this.contentEndingIndex + this.relevantGap.startTime);

				//if the portion we decided to highlight is big enough, then highlight it; otherwise, play around with the sensitivity, then run this algorithm again
				if (this.contentEndingIndex > this.contentStartingIndex + 50) {
					// console.log(this.recursionTracker)
					this.$store.commit(
						"updateStartTimePrompter",
						(this.contentStartingIndex + this.relevantGap.startTime) / 100
					);
					this.$store.commit(
						"updateEndTimePrompter",
						(this.contentEndingIndex + this.relevantGap.startTime) / 100
					);

					// console.log((this.contentStartingIndex + this.relevantGap.startTime) / 100)
					// console.log((this.contentEndingIndex + this.relevantGap.startTime) / 100)

					this.$store.commit("forceRegionRerender");
				} else {
					// this.recursionTracker+=1
					if (this.sensitivity > 50) {
						// if (this.recursionTracker>=900)
						// {console.log(this.recursionTracker)
						// console.log(this.recursionStopper)}

						this.sensitivity = 0.05;
						if (this.recursionStopper == true) {
							// dump the silence
							// console.log(
							// 	"dumped the silence.  New gaps should start at " +
							// 		(this.relevantGap.endTime - 5)
							// );
							this.usableGaps[0].startTime = this.relevantGap.endTime - 5;

							this.emitNewPrompt();
						} else if (this.recursionStopper == false) {
							// console.log("resetting sensitivity to .05")
							this.recursionStopper = true;
							this.newPromptorScribingToggle = false;
							this.newPromptsfunc();
						}
					} else {
						// console.log("upping the sensitivity to " + this.sensitivity)
						this.sensitivity += 0.05;
						this.newPromptsfunc();
					}
				}
				// this.recursionTracker=0
				// this.sensitivity=.1
				// this.allowSubmit = true;
				this.$refs.promptertextarea.focus();
			} else if (this.onemoregap == true) {
				this.onemoregap = false
				this.nomoregaps = true
				// a little gap to work with to generate this prompt
				this.relevantGap.startTime = parseInt(this.usableGaps[0].startTime); // should be in hundredths of a second
				this.relevantGap.endTime = Math.min(
					parseInt(this.usableGaps[0].startTime) +
					parseInt(this.scribingclean) +
					100,
					parseInt(this.usableGaps[0].endTime)
				); // should be in hundredths of a second               // FLAG ARBITRARY TIME DECISION
				this.relevantGap.startCharacter = parseInt(
					this.usableGaps[0].startCharacter
				);
				this.relevantGap.endCharacter = parseInt(
					this.usableGaps[0].endCharacter
				);
				// this.usablePeaksData=[1 , 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0]
				// get information about the waveform for the little gap we are currently working with and map it to 1's and 0's depending on a preset sensitivity level
				this.usablePeaksData = this.$store.state.peaksData
					.slice(this.relevantGap.startTime, this.relevantGap.endTime)
					.map((e) => Math.round(e * 1000) / 10)
					.map((e) => {
						if (Math.abs(e) > this.sensitivity) {
							return 1;
						} else {
							return 0;
						}
					});

				// find the largest set of content within the currently selected portion of audio that has a silence-ish gap on either side
				let greenlight = false;
				let priorvalue = null;
				for (let i = 0; i < this.usablePeaksData.length; i++) {
					if (
						this.usablePeaksData[i] == 1 
						// &&
						// (priorvalue <= 0 || priorvalue == null)
					) {
						priorvalue = 1;
					} else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 1 &&
						priorvalue < 3 &&
						greenlight == true
					) {
						priorvalue++;
					} else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 3 &&
						greenlight == true
					) {
						this.contentStartingIndex = i - 7;
						break;
					} else if (
						this.usablePeaksData[i] == 0 &&
						(priorvalue == null || priorvalue > 0)
					) {
						priorvalue = 0;
					}
					//if we are in the middle of silence?
					else if (
						this.usablePeaksData[i] == 0 &&
						priorvalue > -1 &&
						priorvalue <= 0
					) {
						priorvalue--;
					}
					//if we are in the middle of silence
					else if (this.usablePeaksData[i] == 0 && priorvalue <= -1) {
						priorvalue = 0;
						greenlight = true;
					}
					// console.log(priorvalue);
				}
				priorvalue = null;
				greenlight = true;

				for (let i = this.usablePeaksData.length - 1; i >= 0; i--) {
					//if we are just starting a streak of 1's
					if (
						this.usablePeaksData[i] == 1 
						&&
						(priorvalue <= 0 || priorvalue == null)
					) {
						priorvalue = 1;
					}

					//if we are in the middle of a streak of 1's and we are allowed to start searching for content
					else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 1 &&
						priorvalue < 3 &&
						greenlight == true
					) {
						priorvalue++;
					}

					//if we have met our streak quota of content
					else if (
						this.usablePeaksData[i] == 1 &&
						priorvalue >= 3 &&
						greenlight == true
					) {
						this.contentEndingIndex = i + 5;
						break;
					}

					//if silence is just starting
					else if (
						this.usablePeaksData[i] == 0 &&
						(priorvalue == null || priorvalue > 0)
					) {
						priorvalue = 0;
					}
					//if we are in the middle of silence
					else if (
						this.usablePeaksData[i] == 0 &&
						priorvalue > -1 &&
						priorvalue <= 0
					) {
						priorvalue--;
					}
					//if we are in the middle of silence
					else if (this.usablePeaksData[i] == 0 && priorvalue <= -1) {
						priorvalue = 0;
						greenlight = true;
					}
					// console.log(priorvalue);
				}

				this.$store.commit(
					"updateStartTimePrompter",
					(this.contentStartingIndex + this.relevantGap.startTime) / 100
				);
				this.$store.commit(
					"updateEndTimePrompter",
					(this.contentEndingIndex + this.relevantGap.startTime) / 100
				);

				// console.log((this.contentStartingIndex + this.relevantGap.startTime) / 100)
				// console.log((this.contentEndingIndex + this.relevantGap.startTime) / 100)

				this.$store.commit("forceRegionRerender");
				// this.recursionTracker=0
				// this.sensitivity=.1
				// this.allowSubmit = true;
				this.$refs.promptertextarea.focus();



			}
			else {
				// console.log("setting nomoregaps at point 2")
				this.nomoregaps = true;
			}
		},

		emitNewPrompt() {
			this.$emit("generateNewPrompt"); //
		},

		// convert a value from seconds to HH:MM:SS
		secondsToTime(seconds) {
			var date = new Date(1970, 0, 1);
			date.setSeconds(seconds);
			return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		},

		// edit the text when the user clicks "Save Edits"
		async updateText() {
			// decide what the new full text should be--where exactly to insert new_text (the user input) into it, and how the carriage returns should be around it.

			// if (Number.isNaN(this.relevantGap.endCharacter) == false) {
			//if the gap does have an ending
			let lastGapEndCharacter = this.associationGaps[0].endCharacter;
			// console.log(this.new_text);
			// console.log("defaulting to " + lastGapEndCharacter);
			// if (
			// 	this.associationGaps.length == 1 &&
			// 	this.$store.state.startTimePrompter * 100 <
			// 		this.associationGaps[0].startTime
			// ) {
			// 	lastGapEndCharacter = 0;
			// } else if (
			// 	this.associationGaps.length == 1 &&
			// 	this.$store.state.startTimePrompter * 100 >=
			// 		this.associationGaps[0].startTime
			// ) {
			// 	lastGapEndCharacter = this.associationGaps[0].startCharacter;
			// }
			// if there are at least two chunks, and we are already past the end of the first chunk, then update lastGapEndCharacter
			// console.log(this.associationGaps.length + " is greater than 1")
			// console.log(this.$store.state.startTimePrompter*100 + " is greater than or equal to " + this.associationGaps[1].startTime)

			// if there is only one gap where text could go, or if we are in the first chunk before any of the gaps start (this second standard is almost impossible to meet)
			// then put new text after the first chunk
			// otherwise:

			if (
				this.associationGaps.length > 1 &&
				this.$store.state.startTimePrompter * 100 >=
				this.associationGaps[0].startTime
			) {
				// console.log("in");
				for (let i = 0; i < this.associationGaps.length; i++) {
					// console.log(i);
					// console.log(
					// 	"is " +
					// 		this.$store.state.startTimePrompter * 100 +
					// 		" less than " +
					// 		this.associationGaps[i + 1].startTime +
					// 		"?"
					// );
					// console.log(this.associationGaps[i]);
					// console.log(
					// 	this.$store.state.startTimePrompter * 100 +
					// 		"wants to be greater than or equal to " +
					// 		this.associationGaps[i].startTime
					// );
					// console.log(this.associationGaps[i + 1]);
					// console.log(
					// 	this.$store.state.startTimePrompter * 100 +
					// 		"wants to be less than " +
					// 		this.associationGaps[i + 1].startTime
					// );
					if (
						// if it's in the gap before the last chunk
						this.$store.state.startTimePrompter * 100 >=
						this.associationGaps[i].startTime &&
						this.$store.state.startTimePrompter * 100 <
						this.associationGaps[i].endTime &&
						this.associationGaps[i + 1].endCharacter == null
					) {
						// place the new text before the last chunk
						// console.log("in 1");
						// console.log(
						// 	this.$store.state.startTimePrompter * 100 +
						// 		"is less than " +
						// 		this.associationGaps[i + 1].startTime
						// );
						lastGapEndCharacter = this.associationGaps[i].endCharacter;
						break;
					} else if (
						// if it's in the last chunk
						this.$store.state.startTimePrompter * 100 >=
						this.associationGaps[i].endTime &&
						this.associationGaps[i + 1].endCharacter == null
					) {
						// place the new text at the end of all of the old text
						// console.log("in 1.3");
						// console.log(
						// 	this.$store.state.startTimePrompter * 100 +
						// 		"is less than " +
						// 		this.associationGaps[i + 1].startTime
						// );
						lastGapEndCharacter = this.associationGaps[i + 1].endCharacter;
						break;
					} else if (
						// if it's in a gap that is not the last-gap section of the audio file
						this.$store.state.startTimePrompter * 100 >=
						this.associationGaps[i].startTime &&
						this.$store.state.startTimePrompter * 100 <
						this.associationGaps[i].endTime &&
						this.associationGaps[i].endCharacter != null
					) {
						// place the new text after the gap (before the next chunk)
						// console.log("in 1.6");
						lastGapEndCharacter = this.associationGaps[i].endCharacter;
						break;
					} else if (
						// if it's in a chunk that is not the last chunk
						this.$store.state.startTimePrompter * 100 >=
						this.associationGaps[i].endTime &&
						this.$store.state.startTimePrompter * 100 <
						this.associationGaps[i + 1].startTime &&
						this.associationGaps[i + 1].startCharacter != null
					) {
						// place the new text after the chunk
						// console.log("in 2");
						lastGapEndCharacter = this.associationGaps[i + 1].endCharacter;
						break;
					} else if (
						// if it's after the last gap (so it's in the last chunk, which stretches to the end)
						this.$store.state.startTimePrompter * 100 >=
						this.associationGaps[this.associationGaps.length - 1].endTime
					) {
						// console.log("in 3"); // place the new text before the last chunk
						lastGapEndCharacter =
							this.associationGaps[this.associationGaps.length - 1]
								.endCharacter;
						break;
					}
					// NEED TO FINISH THIS PART, FLAG!!!!!}
					// else if (i + 1 == this.associationGaps.length-1) {
					// 	// console.log(
					// 	// 	this.associationGaps[this.associationGaps.length - 1].endCharacter
					// 	// );
					// 	console.log("in 2")
					// 	lastGapEndCharacter =
					// 		this.associationGaps[i+2]
					// 			.endCharacter;
					// 	break;
					// }
				}
			}

			// console.log(lastGapEndCharacter);

			if (lastGapEndCharacter == null) {
				let temp_latesttext = this.original_text;
				if (
					this.original_text[this.original_text.length - 2] == "\n" &&
					this.original_text[this.original_text.length - 1] == "\n"
				) {
					// console.log("following two carriage returns; no need to add one");
					temp_latesttext = temp_latesttext + this.new_text;
				} else if (
					this.original_text[this.original_text.length - 2] != "\n" &&
					this.original_text[this.original_text.length - 1] == "\n"
				) {
					// console.log("following a single carriage return; need to add one");
					temp_latesttext = temp_latesttext + "\n" + this.new_text;
				} else if (
					(this.original_text[this.original_text.length - 2] != "\n" &&
						this.original_text[this.original_text.length - 1] != "\n") ||
					(this.original_text[this.original_text.length - 2] == "\n" &&
						this.original_text[this.original_text.length - 1] != "\n")
				) {
					// console.log("following no carriage returns; need to add two");
					temp_latesttext = temp_latesttext + "\n" + "\n" + this.new_text;
				}
				// console.log("gap end character: " + this.relevantGap.endCharacter)
				// console.log(this.original_text[this.relevantGap.endCharacter])
				// console.log(this.original_text[this.relevantGap.endCharacter + 1])
				this.latest_text = temp_latesttext;
				// console.log(this.latest_text)
			} else {
				lastGapEndCharacter = lastGapEndCharacter - 1;
				let temp_latesttext = this.original_text.substring(
					0,
					lastGapEndCharacter
				);
				// console.log(temp_latesttext);
				if (
					this.original_text[lastGapEndCharacter - 2] == "\n" &&
					this.original_text[lastGapEndCharacter - 1] == "\n"
				) {
					// console.log("following two carriage returns; no need to add one")
					temp_latesttext = temp_latesttext + this.new_text;
				} else if (
					this.original_text[lastGapEndCharacter - 2] != "\n" &&
					this.original_text[lastGapEndCharacter - 1] == "\n"
				) {
					// console.log("following a single carriage return; need to add one")
					temp_latesttext = temp_latesttext + "\n" + this.new_text;
				} else if (
					(this.original_text[lastGapEndCharacter - 2] != "\n" &&
						this.original_text[lastGapEndCharacter - 1] != "\n") ||
					(this.original_text[lastGapEndCharacter - 2] == "\n" &&
						this.original_text[lastGapEndCharacter - 1] != "\n")
				) {
					// console.log("following no carriage returns; need to add two")
					temp_latesttext = temp_latesttext + "\n" + "\n" + this.new_text;
				}
				// console.log("gap end character: " + this.relevantGap.endCharacter)
				// console.log(this.original_text[this.relevantGap.endCharacter])
				// console.log(this.original_text[this.relevantGap.endCharacter + 1])
				if (
					this.original_text[lastGapEndCharacter] == "\n" &&
					this.original_text[lastGapEndCharacter + 1] == "\n"
				) {
					// console.log("precedeing two carriage returns; no need to add any")
					temp_latesttext =
						temp_latesttext + this.original_text.substring(lastGapEndCharacter);
				} else if (
					this.original_text[lastGapEndCharacter] == "\n" &&
					this.original_text[lastGapEndCharacter + 1] != "\n"
				) {
					// console.log("preceding one carriage return; need to add one")
					temp_latesttext =
						temp_latesttext +
						"\n" +
						this.original_text.substring(lastGapEndCharacter);
				} else if (
					(this.original_text[lastGapEndCharacter] != "\n" &&
						this.original_text[lastGapEndCharacter + 1] != "\n") ||
					(this.original_text[lastGapEndCharacter] != "\n" &&
						this.original_text[lastGapEndCharacter + 1] == "\n")
				) {
					// console.log("preceding no carriage returns; need to add two")
					temp_latesttext =
						temp_latesttext +
						"\n" +
						"\n" +
						this.original_text.substring(lastGapEndCharacter);
				}
				this.latest_text = temp_latesttext;
			}
			// }
			// shouldn't need this anymore
			// else if (Number.isNaN(this.relevantGap.endCharacter) == true) {
			// 	// if the gap does not have an ending
			// 	let temp_latesttext = this.original_text;
			// 	if (
			// 		this.original_text[this.original_text.length - 2] == "\n" &&
			// 		this.original_text[this.original_text.length - 1] == "\n"
			// 	) {
			// 		temp_latesttext = temp_latesttext + this.new_text + "\n";
			// 	} else if (
			// 		this.original_text[this.original_text.length - 2] != "\n" &&
			// 		this.original_text[this.original_text.length - 1] == "\n"
			// 	) {
			// 		temp_latesttext = temp_latesttext + "\n" + this.new_text + "\n";
			// 	} else if (
			// 		this.original_text[this.original_text.length - 2] != "\n" &&
			// 		this.original_text[this.original_text.length - 1] != "\n"
			// 	) {
			// 		temp_latesttext =
			// 			temp_latesttext + "\n" + "\n" + this.new_text + "\n";
			// 	}
			// 	this.latest_text = temp_latesttext;
			// }

			let textLengthDifference =
				this.latest_text.length - this.original_text.length;
			for (let prop in this.new_associations) {
				delete this.new_associations[prop];
			}
			this.instructions = this.patienceDiffPlus(
				this.original_text_cleaned,
				this.latest_text_cleaned
			);

			// console.log("associations: " + JSON.stringify(this.new_associations));
			for (let i = this.instructions.lines.length - 1; i >= 0; i--) {
				if (
					this.instructions.lines[i].aIndex == this.instructions.lines[i].bIndex
				) {
					this.instructions.lines.splice(i, 1);
				}
			}

			// console.log(this.instructions.lines)

			// let instructionsmapped = this.instructions.lines.map(
			// 	(item) => item.bIndex
			// );
			// console.log(instructionsmapped)

			// if (this.spaced_by != "") {
			this.instructions.lines.forEach((element) => {
				// console.log(element['bIndex'])
				// console.log(element)
				if (
					element["bIndex"] >= 0 &&
					element["aIndex"] == -1 &&
					element["line"] != "\n"
				) {
					this.new_associations[element["bIndex"]] = {};
					this.new_associations[element["bIndex"]][
						Math.round(
							((this.$store.state.startTimePrompter +
								this.$store.state.endTimePrompter) *
								100) /
							2
						)
					] = Math.round(
						((this.$store.state.endTimePrompter -
							this.$store.state.startTimePrompter) *
							100) /
						2
					);
				}
			});
			// } else if (this.spaced_by == "") {
			// 	//if gap ends in other text
			// 	if (Number.isNaN(this.relevantGap.endCharacter) == false) {
			// 		for (let l = 0; l < textLengthDifference - 1; l++) {
			// 			let indexofchar = instructionsmapped.indexOf(
			// 				this.relevantGap.endCharacter + l
			// 			);
			// 			// console.log(indexofchar)
			// 			// console.log(this.instructions.lines[indexofchar]);

			// 			if (this.instructions.lines[indexofchar]["line"] != "\n") {
			// 				this.new_associations[this.relevantGap.endCharacter + l] = {};
			// 				this.new_associations[this.relevantGap.endCharacter + l][
			// 					Math.round(
			// 						((this.$store.state.startTimePrompter +
			// 							this.$store.state.endTimePrompter) *
			// 							100) /
			// 							2
			// 					)
			// 				] = Math.round(
			// 					((this.$store.state.endTimePrompter -
			// 						this.$store.state.startTimePrompter) *
			// 						100) /
			// 						2
			// 				);
			// 			}
			// 		}
			// 	}

			// 	// if no text following the "gap"
			// 	// shouldn't need this anymore
			// 	// else if (Number.isNaN(this.relevantGap.endCharacter) == true) {
			// 	// 	for (let l = 1; l < textLengthDifference; l++) {
			// 	// 		let indexofchar = instructionsmapped.indexOf(
			// 	// 			this.original_text.length - 1 + l
			// 	// 		);
			// 	// 		// console.log(indexofchar)
			// 	// 		// console.log(this.instructions.lines[indexofchar]);

			// 	// 		if (this.instructions.lines[indexofchar]["line"] != "\n") {
			// 	// 			this.new_associations[this.original_text.length - 1 + l] = {};
			// 	// 			this.new_associations[this.original_text.length - 1 + l][
			// 	// 				Math.round(
			// 	// 					((this.$store.state.startTimePrompter +
			// 	// 						this.$store.state.endTimePrompter) *
			// 	// 						100) /
			// 	// 						2
			// 	// 				)
			// 	// 			] = Math.round(
			// 	// 				((this.$store.state.endTimePrompter -
			// 	// 					this.$store.state.startTimePrompter) *
			// 	// 					100) /
			// 	// 					2
			// 	// 			);
			// 	// 		}
			// 	// 	}
			// 	// }
			// }

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

			fetch(
				process.env.VUE_APP_api_URL +
				"interpretations/" +
				this.interpretation_id +
				"/audio/" +
				this.audio_id +
				"/" +
				this.interpretationStatus +
				"/",
				{
					method: "PATCH",
					body: JSON.stringify({
						latest_text: this.latest_text.normalize("NFC"),
						instructions: this.instructions,
						editingversion: this.editingversion,
					}),
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
				}
			)
				.then((response) => {
					return response.json();
				})
				.then((response) => {
					if (response == "interpretation updated") {
						this.tempeditingversion = this.editingversion
						this.$emit("updateTitleLanguage", { "id": this.interpretation_id, "title": this.title, "language": this.language_name });
						// console.log(textLengthDifference);
						// console.log(this.tempeditingversion + this.editingversion)
						this.associationGaps.forEach((element) => {
							element.startCharacter += textLengthDifference;
							if (element.endCharacter != null) {
								element.endCharacter += textLengthDifference;
							}

							return;
						}); //increase every startcharacter and endcharacter

						this.newPromptsfunc();
						// console.log(this.tempeditingversion + this.editingversion)

						//add in the association for the new phrase.
						fetch(
							process.env.VUE_APP_api_URL +
							"content/" +
							this.audio_id +
							"/" +
							this.interpretation_id,
							{
								method: "POST",
								body: JSON.stringify({
									// text: this.latest_text.normalize('NFC'), // Pass in a string that meets a minimum character fcount and includes all the new tags you want to save
									associations: this.new_associations, // Pass in the list of the new tags
									editingversion: this.tempeditingversion + 1,
								}),

								headers: {
									"Content-Type": "application/json",

									Authorization: this.$store.state.idToken,
								},
							}
						)
							.then((response) => { return response.json() })
							.then((response) => {
								if (response.error == "not editing current version") {
									alert("This interpretation has been edited since you last loaded it; please refresh your page and try again.")
								}
								else { this.$emit("updateTitleLanguage", { "id": this.interpretation_id, "title": this.title, "language": this.language_name }); }
							}

							)
							.catch((error) => console.error("Error:", error));
					} else if (response == "not editing current version") {
						alert("This interpretation has been edited since you last loaded it; please refresh your page and try again.")
					} else { alert("something broke") }
					// console.log(this.tempeditingversion + this.editingversion)

					return;
				})
				.catch((error) => console.error("Error:", error));
			// console.log("original text: " + this.original_text);
			// console.log(this.original_text.length);
			this.original_text = this.latest_text;
			// console.log("original text: " + this.original_text);
			// console.log(this.original_text.length);
		},

		/**
		 * program: "patienceDiff" algorithm implemented in javascript.
		 * author: Jonathan Trent
		 * version: 2.0
		 *
		 * use:  patienceDiff( aLines[], bLines[], diffPlusFlag )
		 *
		 * where:
		 *      aLines[] contains the original text lines.
		 *      bLines[] contains the new text lines.
		 *      diffPlusFlag if true, returns additional arrays with the subset of lines that were
		 *          either deleted or inserted.  These additional arrays are used by patienceDiffPlus.
		 *
		 * returns an object with the following properties:
		 *      lines[] with properties of:
		 *          line containing the line of text from aLines or bLines.
		 *          aIndex referencing the index in aLines[].
		 *          bIndex referencing the index in bLines[].
		 *              (Note:  The line is text from either aLines or bLines, with aIndex and bIndex
		 *               referencing the original index. If aIndex === -1 then the line is new from bLines,
		 *               and if bIndex === -1 then the line is old from aLines.)
		 *      lineCountDeleted is the number of lines from aLines[] not appearing in bLines[].
		 *      lineCountInserted is the number of lines from bLines[] not appearing in aLines[].
		 *      lineCountMoved is 0. (Only set when using patienceDiffPlus.)
		 *
		 */

		patienceDiff(aLines, bLines, diffPlusFlag) {
			//
			// findUnique finds all unique values in arr[lo..hi], inclusive.  This
			// function is used in preparation for determining the longest common
			// subsequence.  Specifically, it first reduces the array range in question
			// to unique values.
			//
			// Returns an ordered Map, with the arr[i] value as the Map key and the
			// array index i as the Map value.
			//

			function findUnique(arr, lo, hi) {
				const lineMap = new Map();

				for (let i = lo; i <= hi; i++) {
					let line = arr[i];

					if (lineMap.has(line)) {
						lineMap.get(line).count++;
						lineMap.get(line).index = i;
					} else {
						lineMap.set(line, {
							count: 1,
							index: i,
						});
					}
				}

				lineMap.forEach((val, key, map) => {
					if (val.count !== 1) {
						map.delete(key);
					} else {
						map.set(key, val.index);
					}
				});

				return lineMap;
			}

			//
			// uniqueCommon finds all the unique common entries between aArray[aLo..aHi]
			// and bArray[bLo..bHi], inclusive.  This function uses findUnique to pare
			// down the aArray and bArray ranges first, before then walking the comparison
			// between the two arrays.
			//
			// Returns an ordered Map, with the Map key as the common line between aArray
			// and bArray, with the Map value as an object containing the array indexes of
			// the matching unique lines.
			//

			function uniqueCommon(aArray, aLo, aHi, bArray, bLo, bHi) {
				const ma = findUnique(aArray, aLo, aHi);
				const mb = findUnique(bArray, bLo, bHi);

				ma.forEach((val, key, map) => {
					if (mb.has(key)) {
						map.set(key, {
							indexA: val,
							indexB: mb.get(key),
						});
					} else {
						map.delete(key);
					}
				});

				return ma;
			}

			//
			// longestCommonSubsequence takes an ordered Map from the function uniqueCommon
			// and determines the Longest Common Subsequence (LCS).
			//
			// Returns an ordered array of objects containing the array indexes of the
			// matching lines for a LCS.
			//

			function longestCommonSubsequence(abMap) {
				const ja = [];

				// First, walk the list creating the jagged array.

				abMap.forEach((val, key, map) => {
					let i = 0;

					while (ja[i] && ja[i][ja[i].length - 1].indexB < val.indexB) {
						i++;
					}

					if (!ja[i]) {
						ja[i] = [];
					}

					if (0 < i) {
						val.prev = ja[i - 1][ja[i - 1].length - 1];
					}

					ja[i].push(val);
				});

				// Now, pull out the longest common subsequence.

				let lcs = [];

				if (0 < ja.length) {
					let n = ja.length - 1;
					lcs = [ja[n][ja[n].length - 1]];

					while (lcs[lcs.length - 1].prev) {
						lcs.push(lcs[lcs.length - 1].prev);
					}
				}

				return lcs.reverse();
			}

			// "result" is the array used to accumulate the aLines that are deleted, the
			// lines that are shared between aLines and bLines, and the bLines that were
			// inserted.

			const result = [];
			let deleted = 0;
			let inserted = 0;

			// aMove and bMove will contain the lines that don't match, and will be returned
			// for possible searching of lines that moved.

			const aMove = [];
			const aMoveIndex = [];
			const bMove = [];
			const bMoveIndex = [];

			//
			// addToResult simply pushes the latest value onto the "result" array.  This
			// array captures the diff of the line, aIndex, and bIndex from the aLines
			// and bLines array.
			//

			function addToResult(aIndex, bIndex) {
				if (bIndex < 0) {
					aMove.push(aLines[aIndex]);
					aMoveIndex.push(result.length);
					deleted++;
				} else if (aIndex < 0) {
					bMove.push(bLines[bIndex]);
					bMoveIndex.push(result.length);
					inserted++;
				}

				result.push({
					line: 0 <= aIndex ? aLines[aIndex] : bLines[bIndex],
					aIndex: aIndex,
					bIndex: bIndex,
				});
			}

			//
			// addSubMatch handles the lines between a pair of entries in the LCS.  Thus,
			// this function might recursively call recurseLCS to further match the lines
			// between aLines and bLines.
			//

			function addSubMatch(aLo, aHi, bLo, bHi) {
				// Match any lines at the beginning of aLines and bLines.

				while (aLo <= aHi && bLo <= bHi && aLines[aLo] === bLines[bLo]) {
					addToResult(aLo++, bLo++);
				}

				// Match any lines at the end of aLines and bLines, but don't place them
				// in the "result" array just yet, as the lines between these matches at
				// the beginning and the end need to be analyzed first.

				let aHiTemp = aHi;

				while (aLo <= aHi && bLo <= bHi && aLines[aHi] === bLines[bHi]) {
					aHi--;
					bHi--;
				}

				// Now, check to determine with the remaining lines in the subsequence
				// whether there are any unique common lines between aLines and bLines.
				//
				// If not, add the subsequence to the result (all aLines having been
				// deleted, and all bLines having been inserted).
				//
				// If there are unique common lines between aLines and bLines, then let's
				// recursively perform the patience diff on the subsequence.

				const uniqueCommonMap = uniqueCommon(
					aLines,
					aLo,
					aHi,
					bLines,
					bLo,
					bHi
				);

				if (uniqueCommonMap.size === 0) {
					while (aLo <= aHi) {
						addToResult(aLo++, -1);
					}

					while (bLo <= bHi) {
						addToResult(-1, bLo++);
					}
				} else {
					recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap);
				}

				// Finally, let's add the matches at the end to the result.

				while (aHi < aHiTemp) {
					addToResult(++aHi, ++bHi);
				}
			}

			//
			// recurseLCS finds the longest common subsequence (LCS) between the arrays
			// aLines[aLo..aHi] and bLines[bLo..bHi] inclusive.  Then for each subsequence
			// recursively performs another LCS search (via addSubMatch), until there are
			// none found, at which point the subsequence is dumped to the result.
			//

			function recurseLCS(aLo, aHi, bLo, bHi, uniqueCommonMap) {
				const x = longestCommonSubsequence(
					uniqueCommonMap || uniqueCommon(aLines, aLo, aHi, bLines, bLo, bHi)
				);

				if (x.length === 0) {
					addSubMatch(aLo, aHi, bLo, bHi);
				} else {
					if (aLo < x[0].indexA || bLo < x[0].indexB) {
						addSubMatch(aLo, x[0].indexA - 1, bLo, x[0].indexB - 1);
					}

					let i;
					for (i = 0; i < x.length - 1; i++) {
						addSubMatch(
							x[i].indexA,
							x[i + 1].indexA - 1,
							x[i].indexB,
							x[i + 1].indexB - 1
						);
					}

					if (x[i].indexA <= aHi || x[i].indexB <= bHi) {
						addSubMatch(x[i].indexA, aHi, x[i].indexB, bHi);
					}
				}
			}

			recurseLCS(0, aLines.length - 1, 0, bLines.length - 1);

			if (diffPlusFlag) {
				return {
					lines: result,
					lineCountDeleted: deleted,
					lineCountInserted: inserted,
					lineCountMoved: 0,
					aMove: aMove,
					aMoveIndex: aMoveIndex,
					bMove: bMove,
					bMoveIndex: bMoveIndex,
				};
			}

			return {
				lines: result,
				lineCountDeleted: deleted,
				lineCountInserted: inserted,
				lineCountMoved: 0,
			};
		},

		/**
		 * program: "patienceDiffPlus" algorithm implemented in javascript.
		 * author: Jonathan Trent
		 * version: 2.0
		 *
		 * use:  patienceDiffPlus( aLines[], bLines[] )
		 *
		 * where:
		 *      aLines[] contains the original text lines.
		 *      bLines[] contains the new text lines.
		 *
		 * returns an object with the following properties:
		 *      lines[] with properties of:
		 *          line containing the line of text from aLines or bLines.
		 *          aIndex referencing the index in aLine[].
		 *          bIndex referencing the index in bLines[].
		 *              (Note:  The line is text from either aLines or bLines, with aIndex and bIndex
		 *               referencing the original index. If aIndex === -1 then the line is new from bLines,
		 *               and if bIndex === -1 then the line is old from aLines.)
		 *          moved is true if the line was moved from elsewhere in aLines[] or bLines[].
		 *      lineCountDeleted is the number of lines from aLines[] not appearing in bLines[].
		 *      lineCountInserted is the number of lines from bLines[] not appearing in aLines[].
		 *      lineCountMoved is the number of lines that moved.
		 *
		 */

		patienceDiffPlus(aLines, bLines) {
			const difference = this.patienceDiff(aLines, bLines, true);

			let aMoveNext = difference.aMove;
			let aMoveIndexNext = difference.aMoveIndex;
			let bMoveNext = difference.bMove;
			let bMoveIndexNext = difference.bMoveIndex;

			delete difference.aMove;
			delete difference.aMoveIndex;
			delete difference.bMove;
			delete difference.bMoveIndex;

			let lastLineCountMoved;

			do {
				let aMove = aMoveNext;
				let aMoveIndex = aMoveIndexNext;
				let bMove = bMoveNext;
				let bMoveIndex = bMoveIndexNext;

				aMoveNext = [];
				aMoveIndexNext = [];
				bMoveNext = [];
				bMoveIndexNext = [];

				let subDiff = this.patienceDiff(aMove, bMove);

				lastLineCountMoved = difference.lineCountMoved;

				subDiff.lines.forEach((v, i) => {
					if (0 <= v.aIndex && 0 <= v.bIndex) {
						difference.lines[aMoveIndex[v.aIndex]].moved = true;
						difference.lines[bMoveIndex[v.bIndex]].aIndex =
							aMoveIndex[v.aIndex];
						difference.lines[bMoveIndex[v.bIndex]].moved = true;
						difference.lineCountInserted--;
						difference.lineCountDeleted--;
						difference.lineCountMoved++;
					} else if (v.bIndex < 0) {
						aMoveNext.push(aMove[v.aIndex]);
						aMoveIndexNext.push(aMoveIndex[v.aIndex]);
					} else {
						bMoveNext.push(bMove[v.bIndex]);
						bMoveIndexNext.push(bMoveIndex[v.bIndex]);
					}
				});
			} while (0 < difference.lineCountMoved - lastLineCountMoved);

			return difference;
		},
	},

	async mounted() {
		// this.$emit("yesGaps");
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

		fetch(
			process.env.VUE_APP_api_URL +
			"interpretations/" +
			this.interpretation_id +
			"/audio/" +
			this.audio_id +
			"/" +
			this.interpretationStatus +
			"/",
			{
				method: "GET",

				headers: {
					"Content-Type": "application/json",

					Authorization: this.$store.state.idToken,
				},
			}
		)
			.then((response) => response.json())
			.then((data) => {
				this.title = data.interpretation.title;
				this.language_name = data.interpretation.language_name;
				this.latest_text = data.interpretation.latest_text;
				this.original_text = data.interpretation.latest_text;
				this.spaced_by = data.interpretation.spaced_by;
			})

			// access the information about what to highlight, and when, for the interpretation that is to be displayed
			.then(() => {
				fetch(
					process.env.VUE_APP_api_URL +
					"content/" +
					this.audio_id +
					"/" +
					this.interpretation_id +
					"/" +
					200 + // FLAG TIME DECISION
					"/", // timestep is 200 hundredths of seconds
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",

							Authorization: this.$store.state.idToken,
						},
					}
				)
					.then((response) => response.json())
					.then((data) => {
						this.associations = data.associations;
					})
					.then(() => this.findGaps()) // turn the highlighting information from backend into something usable
					// .then(() => {
					// 	this.latest_text_slices(); // split up the displayed text into substrings to be highlighted whenever necessary
					// })
					.catch((error) => console.error("Error:", error));
			})

			.catch((error) => console.error("Error:", error));
	},
};
</script>


<style scoped>
.prompter {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-y: scroll;
}

.prompter::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
}
</style>