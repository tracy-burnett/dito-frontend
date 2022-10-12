

<template>
	<slot></slot>
	<div
		class="flex-auto"
		:style="{ 'font-size': fontsize + 'px' }"
	>
		<span class="px-3 py-1 font-bold border-gray-300 rounded">{{ title }}</span>
		in <span class="px-3 py-1 border-gray-300 rounded">{{ language_name }}</span><br />
		<!-- {{associationGaps}}
-->
		<!-- {{new_associations}}  -->
		<!-- {{scribingclean}} -->
		associations: {{associations}}<br>
		<!-- {{$store.state.startTimePrompter*100}}<br>
		{{$store.state.endTimePrompter*100}}<br> -->
		{{usableGaps}}<br>
		{{relevantGap}}<br>
		{{allowSubmit}}<br>
		<!-- {{sensitivity}}<br> -->
		<!-- {{$store.state.peaksData}}<br> -->
		<!-- {{$store.state.peaksData.map((e) => Math.round(e * 1000) / 10)
					.map((e) => {
						if (Math.abs(e) > this.sensitivity) {
							return 1;
						} else {
							return 0;
						}
					})}} -->
		<!-- {{associationGaps}} -->
		<!-- {{usablePeaksData}}<br> -->
		<!-- {{usablePeaksData2}} -->
		<!-- {{zerosCount}}
		{{consecutiveZerosArray}} -->
		<!-- {{newPromptscounter}} -->
		<!-- {{$store.state.audioDuration}} -->
		<textarea
			class="w-full h-full px-3 py-1 mt-12 mb-3 border-gray-300 rounded"
			:rows="latesttextrows"
			style="overflow: hidden"
			placeholder="enter new text here"
			v-model="new_text"
		></textarea>
		<div v-if="allowSubmit==true">this text will be submitted when a new prompt is generated</div>
		<div v-else-if="allowSubmit==false">this text WILL NOT be submitted when a new prompt is generated</div>
		<!-- {{latest_text.length}}
{{$store.state.consoleswidth}}
{{$store.state.consoles.length}} -->

	</div>
</template>

<script>
export default {
	inheritAttrs: false,
	name: "Editor",
	data: () => {
		return {
			new_text: "",
			language_name: "",
			title: "",
			latest_text: "",
			original_text: "",
			spaced_by: "",
			manuallyDraggedEndTimeMemory: 0,
			new_associations: {},
			associations: null,
			associationGaps: [],
			usableGaps: [],
			relevantGap: {},
			// scribing: 200,
			allowSubmit: false,
			usablePeaksData: [],
			// usablePeaksData2: [],
			contentStartingIndex: null,
			contentEndingIndex: null,
			sensitivity: 0.05, // .3
			// consecutiveZerosArray: [],
			// zerosCount: 0,
		};
	},
	computed: {
		scribingclean() {
			if (this.$store.state.audioDuration < this.scribing) {
				return this.$store.state.audioDuration;
			} else {
				return this.scribing;
			}
		},
		numbernewlines() {
			return this.latest_text.split(/\r\n|\r|\n/).length;
		},
		latesttextrows() {
			return (
				((6 * this.latest_text.length) /
					(this.$store.state.consoleswidth - 570)) *
					this.$store.state.consoles.length +
				this.numbernewlines
			);
		},
	},
	props: {
		// ID of associated audio file
		audio_id: {
			default: "",
		},
		scribing: {
			default: 200,
		},
		newPromptscounter: {
			default: 0,
		},
		// submitcounter: {
		// 	default: 0,
		// },

		fontsize: { default: 12 },

		// ID of interpretation displayed in this Editor
		interpretation_id: { default: "" },

		// whether the interpretation is owned "owner", editable "editor", or only viewable "viewer" by the logged-in user
		interpretationStatus: { default: "" },
	},
	watch: {
		// submitcounter: function () {
		// 	if (this.allowSubmit == true) {
		// 		this.updateText();
		// 	}
		// },
		newPromptscounter: function () {
			if (this.allowSubmit == true && this.new_text != "") {
				// this.newpromptsfunc will be called if submit is successful inside updatetext()
				this.updateText();
			}
			if (this.allowSubmit == false || this.new_text == "") {
				this.newPromptsfunc();
			}
		},
		"$store.state.peaksData": function () {
			// console.log("watched detected in Prompter")
			this.findGaps(); // populates "this.usableGaps"
		},
		"$store.state.startTimePrompter": function () {
			if (
				!(
					this.$store.state.startTimePrompter * 100 >=
						this.relevantGap.startTime &&
					this.$store.state.endTimePrompter * 100 <= this.usableGaps[0].endTime
				)
			) {
				this.allowSubmit = false;
			} else {
				this.allowSubmit = true;
			}
		},
		"$store.state.endTimePrompter": function () {
			if (
				!(
					this.$store.state.startTimePrompter * 100 >=
						this.relevantGap.startTime &&
					this.$store.state.endTimePrompter * 100 <= this.usableGaps[0].endTime
				)
			) {
				this.allowSubmit = false;
			} else {
				this.allowSubmit = true;
			}
		},
		"$store.state.triggerNewText": function () {
			this.verifyNewText();
		},
	},
	methods: {


		escapeRegex: function (string) {
    		return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		},

		findGaps: function () {
			// console.log("find gaps begun")
			if (this.$store.state.audioDuration > 0) {
				// console.log("inside first if")
				this.associationGaps.length = 0;
				if (Object.keys(this.associations).length > 0) {
					//all bounded gaps
					for (let i = 0; i < Object.keys(this.associations).length - 1; i++) {
						let startTime = Object.keys(this.associations)[i].split("-")[1];
						let endTime = Object.keys(this.associations)[i + 1].split("-")[0];
						let intervalsCount = Object.values(this.associations)[i].length;

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

						let endCharacterArray = [];
						for (let j = 0; j < intervalsCount; j++) {
							//get smallest character number from association i+1 to be the endChar for the gap
							endCharacterArray.push(
								Object.values(this.associations)[i + 1][j].split("-")[0]
							);
						}
						// console.log(endCharacterArray);
						let endCharacter = endCharacterArray.reduce(function (a, b) {
							return Math.min(a, b);
						}, Infinity);

						let associationsObject = {};
						associationsObject.startTime = startTime;
						associationsObject.endTime = endTime;
						associationsObject.startCharacter = startCharacter;
						associationsObject.endCharacter = endCharacter;

						this.associationGaps.push(associationsObject);
					}

					//final
					let startTime = Object.keys(this.associations)[
						Object.keys(this.associations).length - 1
					].split("-")[1];
					let endTime = this.$store.state.audioDuration;

					let intervalsCount = Object.values(this.associations)[
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

					let associationsObject = {};
					associationsObject.startTime = startTime;
					associationsObject.endTime = endTime;

					associationsObject.startCharacter = startCharacter;
					associationsObject.endCharacter = null;
					this.associationGaps.push(associationsObject);

					this.associationGaps.forEach((element) => {
						if (
							element.endTime - element.startTime > 200 && // FLAG TIME DECISION
							(element.startCharacter == element.endCharacter ||
								element.endCharacter == null)
						) {
							this.usableGaps.push(element);
						}
					});
				} else {
					let associationsObject = {};
					associationsObject.startTime = 0;
					associationsObject.endTime = this.$store.state.audioDuration;

					associationsObject.startCharacter = 0;
					associationsObject.endCharacter = null;
					this.associationGaps.push(associationsObject);

					if (associationsObject.endTime - associationsObject.startTime > 200) {
						// FLAG TIME DECISION
						this.usableGaps.push(this.associationGaps[0]);
					}
				}
				//         console.log(this.associationGaps)
				// console.log(this.usableGaps)
				// console.log("find gaps completed")

				this.newPromptsfunc();
			}
		},

		newPromptsfunc() {
			// console.log("sensitivity " + this.sensitivity);
			this.contentEndingIndex = 0;
			this.contentStartingIndex = 0;
			// console.log(this.usableGaps[0].startTime)
			if (
				this.$store.state.audioDuration > 0 &&
				this.usableGaps.length > 0 &&
				parseInt(this.usableGaps[0].startTime) + 100 <
					this.$store.state.audioDuration / 10
			) {
				this.relevantGap.startTime = parseInt(this.usableGaps[0].startTime); // should be in hundredths of a second
				// console.log(this.relevantGap.startTime)
				this.relevantGap.endTime =
					parseInt(this.usableGaps[0].startTime) +
					parseInt(this.scribingclean) +
					100; // should be in hundredths of a second               // FLAG TIME DECISION
				// console.log(this.relevantGap.endTime)
				this.relevantGap.startCharacter = parseInt(
					this.usableGaps[0].startCharacter
				);
				this.relevantGap.endCharacter = parseInt(
					this.usableGaps[0].endCharacter
				);
				// this.usablePeaksData=[1 , 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0]
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
				let greenlight = false;
				let priorvalue = null;
				for (let i = 0; i < this.usablePeaksData.length; i++) {
					if (
						this.usablePeaksData[i] == 1 &&
						(priorvalue <= 0 || priorvalue == null)
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
						// console.log("ping")
					}
					// console.log(priorvalue);
				}
				priorvalue = null;
				greenlight = false;
				for (let i = this.usablePeaksData.length - 1; i >= 0; i--) {
					//if we are just starting a streak of 1's
					if (
						this.usablePeaksData[i] == 1 &&
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
						// console.log("ping");
					}
					// console.log(priorvalue);
				}
				// this.usablePeaksData2 = this.usablePeaksData
				// 	.slice(this.contentStartingIndex, this.contentEndingIndex+1)
				// 	.map((e) => Math.round(e * 1000) / 10)
				// 	.map((e) => {
				// 		if (Math.abs(e) > 0.5) {
				// 			return 1;
				// 		} else {
				// 			return 0;
				// 		}
				// 	});

				if (
					(this.usableGaps[0].endTime -
						(this.contentEndingIndex + this.relevantGap.startTime - 5) >=
					this.scribingclean // FLAG TIME DECISION
				) && (this.contentEndingIndex >= 5)) {
					// console.log(this.contentEndingIndex - 5 + this.relevantGap.startTime);

					this.usableGaps[0].startTime =
						Math.max(this.manuallyDraggedEndTimeMemory*100, this.contentEndingIndex - 5 + this.relevantGap.startTime); // should be in hundredths of a second
					// console.log(this.usableGaps[0].startTime);
				} else if (
					this.usableGaps[0].endTime -
						(this.contentEndingIndex - 5 + this.relevantGap.startTime) <
					this.scribingclean // FLAG TIME DECISION
				) {
					this.usableGaps.shift();
				}
				if (this.contentEndingIndex > this.contentStartingIndex + 50) {
					// console.log(this.contentStartingIndex + this.relevantGap.startTime);
					// console.log(this.contentEndingIndex + this.relevantGap.startTime);
					// console.log(this.usablePeaksData)
					this.$store.commit(
						"updateStartTimePrompter",
						(this.contentStartingIndex + this.relevantGap.startTime) / 100
					);
					this.$store.commit(
						"updateEndTimePrompter",
						(this.contentEndingIndex + this.relevantGap.startTime) / 100
					);
					this.$store.commit("forceRegionRerender");
					// console.log("original text: " + this.original_text)
					// console.log("original text length: " + this.original_text.length)
					// console.log(this.relevantGap)
					// decide how to populate new_text (the text box) when the prompt is first generated
					if (Number.isNaN(this.relevantGap.endCharacter) == false) {
						// if the gap ends at other text
						// console.log("in if")
						this.new_text = this.original_text.substring(
							this.relevantGap.startCharacter + 1,
							this.relevantGap.endCharacter
						);
					} else {
						// if the gap doesn't have a concrete end, is just null
						this.new_text = this.original_text.substring(
							this.relevantGap.startCharacter + 1
						);
					}
					if (this.new_text[0] == "\n") {
						//if there is a carriage return at the beginning of the relevant text segment and it is not the only character, then skip it
					// console.log("NEW TEXT before adjustment: " + this.new_text)
					// console.log("new text length: " + this.new_text.length)
					// console.log("start character before adjustment: " + this.relevantGap.startCharacter + "=" + this.usableGaps[0].startCharacter)
						this.relevantGap.startCharacter += 2;
						this.new_text = this.new_text.substring(2);
						this.usableGaps[0].startCharacter += 2;
					// console.log("start character after adjustment: " + this.relevantGap.startCharacter + "=" + this.usableGaps[0].startCharacter)
					// console.log("NEW TEXT after adjustment: " + this.new_text)
					}
					if (this.new_text[this.new_text.length-1] == "\n") {
						//if there is a carriage return at the end of the relevant text segment and it is not the only character, then roll back from it
					// console.log("NEW TEXT before adjustment: " + this.new_text)
					// console.log("new text length: " + this.new_text.length)
					// console.log("start character before adjustment: " + this.relevantGap.startCharacter + "=" + this.usableGaps[0].startCharacter)
						this.relevantGap.endCharacter -= 1;
						this.new_text = this.new_text.substring(0,this.new_text.length-2);
						this.usableGaps[0].endCharacter -= 1;
					// console.log("start character after adjustment: " + this.relevantGap.startCharacter + "=" + this.usableGaps[0].startCharacter)
					// console.log("NEW TEXT after adjustment: " + this.new_text)
					}
				} else {
					if (this.sensitivity > 50) {

						//dump the first few seconds because they're all silence



							this.sensitivity=.05

							this.newPromptsfunc()







					} else {
					this.sensitivity += 0.05;
					this.newPromptsfunc();}
				}
				// console.log(this.relevantGap.startTime)

				// this.sensitivity=.1
				this.allowSubmit = true;
			}
		},

		// convert a value from seconds to HH:MM:SS
		secondsToTime(seconds) {
			var date = new Date(1970, 0, 1);
			date.setSeconds(seconds);
			return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		},

		verifyNewText() {
			// console.log("in verify new text function in prompter");
			// decide how to populate new_text (the text box) after region is changed in audio player
			if (Number.isNaN(this.relevantGap.endCharacter) == false) {
				// if the gap ends at other text
				// console.log("in if");
				this.new_text = this.original_text.substring(
					this.relevantGap.startCharacter + 1,
					this.relevantGap.endCharacter
				);
			} else {
				// console.log("in else"); // if the gap doesn't have a concrete end, is just null
				this.new_text = this.original_text.substring(
					this.relevantGap.startCharacter + 1
				);
			}
			// console.log("NEW TEXT " + this.new_text);
			if (this.new_text[0] == "\n") {
				// console.log("in second if");
				this.relevantGap.startCharacter += 2;
				this.new_text = this.new_text.substring(2);
				this.usableGaps[0].startCharacter += 2;
			}



					if (this.new_text[this.new_text.length-1] == "\n") {
						this.relevantGap.endCharacter -= 1;
						this.new_text = this.new_text.substring(0,this.new_text.length-2);
						this.usableGaps[0].endCharacter -= 1;
					}


			// console.log(
			// 	"NEW TEXT after editing region in audio player: " + this.new_text
			// );
		},

		// edit the text when the user clicks "Save Edits"
		updateText() {
			// console.log(this.original_text);
			// console.log("original text length: " + this.original_text.length);
			// console.log(this.relevantGap.startCharacter);
			// console.log(this.new_text);
			// console.log("new text length: " + this.new_text.length);

			// decide what the new full text should be--where exactly to insert new_text (the user input) into it.
			if (Number.isNaN(this.relevantGap.endCharacter) == false) {
				// if the gap does have an ending
				this.latest_text =
					this.original_text.substring(0, this.relevantGap.startCharacter + 1) +
					"\n" +
					this.new_text +
					"\n" +
					this.original_text.substring(this.relevantGap.endCharacter);
			} else {
				this.latest_text = // if endcharacter is not a number (it would be null, in this case)
					this.original_text.substring(0, this.relevantGap.startCharacter + 1) +
					"\n" +
					this.new_text +
					"\n" +
					this.original_text.substring(this.relevantGap.startCharacter + 1);
			}

			// console.log(this.latest_text);

			// console.log(this.latest_text.length)

			let textLengthDifference =
				this.latest_text.length - this.original_text.length;
			for (let prop in this.new_associations) {
				delete this.new_associations[prop];
			}
			// console.log(this.$store.state.startTimePrompter)
			// console.log(this.$store.state.endTimePrompter)
			
			let regexwithspacedby = new RegExp(`${this.escapeRegex(this.spaced_by)}|\n`);



			// console.log("spaced by" + this.spaced_by + ".")
			// console.log("total original text: " + this.original_text)
			// console.log("total new text: " + this.latest_text)

			// let origtextclean=
			// if (origtextclean[0]==this.spaced_by) {origtextclean.shift}
			// let latesttextclean=
			// if (latesttextclean[0]==this.spaced_by) {latesttextclean.shift}

			this.instructions = this.patienceDiffPlus(
				this.original_text.split(regexwithspacedby), this.latest_text.normalize("NFC").split(regexwithspacedby)
			);



			// console.log("associations: " + JSON.stringify(this.new_associations));
			for (let i = this.instructions.lines.length - 1; i >= 0; i--) {
				if (
					this.instructions.lines[i].aIndex == this.instructions.lines[i].bIndex
				) {
					this.instructions.lines.splice(i, 1);
				}	

			}


			console.log(JSON.stringify(this.instructions))
		


			this.manuallyDraggedEndTimeMemory = this.$store.state.endTimePrompter


			if (this.spaced_by != "") {
				this.instructions.lines.forEach(element => {
				console.log(element['bIndex'])
					if (element['bIndex'] >= 0) {
					this.new_associations[element['bIndex']] = ((this.$store.state.startTimePrompter +
						this.$store.state.endTimePrompter) *
						100) /
					2;
				}})

			}
			else if (this.spaced_by=="") {
				for (let l = 1; l < textLengthDifference - 1; l++) {
				this.new_associations[this.relevantGap.startCharacter + l] =   
					((this.$store.state.startTimePrompter +
						this.$store.state.endTimePrompter) *
						100) /
					2;
			}
			}


			// console.log("instructions: " + this.instructions);

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
						// console.log(textLengthDifference);
						this.usableGaps.forEach((element) => {
							element.startCharacter += textLengthDifference;
							if (element.endCharacter != null) {
								element.endCharacter += textLengthDifference;
							}

							return;
						}); //increase every startcharacter and endcharacter
						this.newPromptsfunc();
						
						console.log(this.latest_text)
						console.log("TROUBLESHOOTING TODAY" + JSON.stringify(this.new_associations))
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
								}),

								headers: {
									"Content-Type": "application/json",

									Authorization: this.$store.state.idToken,
								},
							}
						)
							.then((response) => response)
							// .then((data) => console.log(data))
							.catch((error) => console.error("Error:", error));
					}

					return;
				})
				.catch((error) => console.error("Error:", error));
			// console.log("original text: " + this.original_text)
			// console.log(this.original_text.length)
			this.original_text = this.latest_text;
			// console.log("original text: " + this.original_text)
			// console.log(this.original_text.length)
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

 patienceDiff( aLines, bLines, diffPlusFlag ) {

//
// findUnique finds all unique values in arr[lo..hi], inclusive.  This
// function is used in preparation for determining the longest common
// subsequence.  Specifically, it first reduces the array range in question
// to unique values.
//
// Returns an ordered Map, with the arr[i] value as the Map key and the
// array index i as the Map value.
//

function findUnique( arr, lo, hi ) {

	const lineMap = new Map();

	for ( let i = lo; i <= hi; i ++ ) {

		let line = arr[ i ];
  
		if ( lineMap.has( line ) ) {

			lineMap.get( line ).count ++;
			lineMap.get( line ).index = i;

		} else {

			lineMap.set( line, {
				count: 1,
				index: i
			} );

		}

	}

	lineMap.forEach( ( val, key, map ) => {

		if ( val.count !== 1 ) {

			map.delete( key );

		} else {

			map.set( key, val.index );

		}

	} );

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

function uniqueCommon( aArray, aLo, aHi, bArray, bLo, bHi ) {

	const ma = findUnique( aArray, aLo, aHi );
	const mb = findUnique( bArray, bLo, bHi );

	ma.forEach( ( val, key, map ) => {

		if ( mb.has( key ) ) {

			map.set( key, {
				indexA: val,
				indexB: mb.get( key )
			} );

		} else {

			map.delete( key );

		}

	} );

	return ma;

}

//
// longestCommonSubsequence takes an ordered Map from the function uniqueCommon
// and determines the Longest Common Subsequence (LCS).
//
// Returns an ordered array of objects containing the array indexes of the
// matching lines for a LCS.
//

function longestCommonSubsequence( abMap ) {

	const ja = [];

	// First, walk the list creating the jagged array.

	abMap.forEach( ( val, key, map ) => {

		let i = 0;
  
		while ( ja[ i ] && ja[ i ][ ja[ i ].length - 1 ].indexB < val.indexB ) {

			i ++;

		}

		if ( ! ja[ i ] ) {

			ja[ i ] = [];

		}

		if ( 0 < i ) {

			val.prev = ja[ i - 1 ][ ja[ i - 1 ].length - 1 ];

		}

		ja[ i ].push( val );

	} );

	// Now, pull out the longest common subsequence.

	let lcs = [];

	if ( 0 < ja.length ) {

		let n = ja.length - 1;
		lcs = [ ja[ n ][ ja[ n ].length - 1 ] ];
  
		while ( lcs[ lcs.length - 1 ].prev ) {

			lcs.push( lcs[ lcs.length - 1 ].prev );

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

function addToResult( aIndex, bIndex ) {

	if ( bIndex < 0 ) {

		aMove.push( aLines[ aIndex ] );
		aMoveIndex.push( result.length );
		deleted ++;

	} else if ( aIndex < 0 ) {

		bMove.push( bLines[ bIndex ] );
		bMoveIndex.push( result.length );
		inserted ++;

	}

	result.push( {
		line: 0 <= aIndex ? aLines[ aIndex ] : bLines[ bIndex ],
		aIndex: aIndex,
		bIndex: bIndex,
	} );

}

//
// addSubMatch handles the lines between a pair of entries in the LCS.  Thus,
// this function might recursively call recurseLCS to further match the lines
// between aLines and bLines.
//

function addSubMatch( aLo, aHi, bLo, bHi ) {

	// Match any lines at the beginning of aLines and bLines.

	while ( aLo <= aHi && bLo <= bHi && aLines[ aLo ] === bLines[ bLo ] ) {

		addToResult( aLo ++, bLo ++ );

	}

	// Match any lines at the end of aLines and bLines, but don't place them
	// in the "result" array just yet, as the lines between these matches at
	// the beginning and the end need to be analyzed first.

	let aHiTemp = aHi;

	while ( aLo <= aHi && bLo <= bHi && aLines[ aHi ] === bLines[ bHi ] ) {

		aHi --;
		bHi --;

	}

	// Now, check to determine with the remaining lines in the subsequence
	// whether there are any unique common lines between aLines and bLines.
	//
	// If not, add the subsequence to the result (all aLines having been
	// deleted, and all bLines having been inserted).
	//
	// If there are unique common lines between aLines and bLines, then let's
	// recursively perform the patience diff on the subsequence.

	const uniqueCommonMap = uniqueCommon( aLines, aLo, aHi, bLines, bLo, bHi );

	if ( uniqueCommonMap.size === 0 ) {

		while ( aLo <= aHi ) {

			addToResult( aLo ++, - 1 );

		}

		while ( bLo <= bHi ) {

			addToResult( - 1, bLo ++ );

		}

	} else {

		recurseLCS( aLo, aHi, bLo, bHi, uniqueCommonMap );

	}

	// Finally, let's add the matches at the end to the result.

	while ( aHi < aHiTemp ) {

		addToResult( ++ aHi, ++ bHi );

	}

}

//
// recurseLCS finds the longest common subsequence (LCS) between the arrays
// aLines[aLo..aHi] and bLines[bLo..bHi] inclusive.  Then for each subsequence
// recursively performs another LCS search (via addSubMatch), until there are
// none found, at which point the subsequence is dumped to the result.
//

function recurseLCS( aLo, aHi, bLo, bHi, uniqueCommonMap ) {

	const x = longestCommonSubsequence( uniqueCommonMap || uniqueCommon( aLines, aLo, aHi, bLines, bLo, bHi ) );

	if ( x.length === 0 ) {

		addSubMatch( aLo, aHi, bLo, bHi );

	} else {

		if ( aLo < x[ 0 ].indexA || bLo < x[ 0 ].indexB ) {

			addSubMatch( aLo, x[ 0 ].indexA - 1, bLo, x[ 0 ].indexB - 1 );

		}

		let i;
		for ( i = 0; i < x.length - 1; i ++ ) {

			addSubMatch( x[ i ].indexA, x[ i + 1 ].indexA - 1, x[ i ].indexB,	x[ i + 1 ].indexB - 1 );

		}

		if ( x[ i ].indexA <= aHi || x[ i ].indexB <= bHi ) {

			addSubMatch( x[ i ].indexA, aHi, x[ i ].indexB, bHi );

		}

	}

}

recurseLCS( 0, aLines.length - 1, 0, bLines.length - 1 );

if ( diffPlusFlag ) {

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

patienceDiffPlus( aLines, bLines ) {

const difference = this.patienceDiff( aLines, bLines, true );

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

	let subDiff = this.patienceDiff( aMove, bMove );

	lastLineCountMoved = difference.lineCountMoved;

	subDiff.lines.forEach( ( v, i ) => {

		if ( 0 <= v.aIndex && 0 <= v.bIndex ) {

			difference.lines[ aMoveIndex[ v.aIndex ] ].moved = true;
			difference.lines[ bMoveIndex[ v.bIndex ] ].aIndex = aMoveIndex[ v.aIndex ];
			difference.lines[ bMoveIndex[ v.bIndex ] ].moved = true;
			difference.lineCountInserted --;
			difference.lineCountDeleted --;
			difference.lineCountMoved ++;

		} else if ( v.bIndex < 0 ) {

			aMoveNext.push( aMove[ v.aIndex ] );
			aMoveIndexNext.push( aMoveIndex[ v.aIndex ] );

		} else {

			bMoveNext.push( bMove[ v.bIndex ] );
			bMoveIndexNext.push( bMoveIndex[ v.bIndex ] );

		}

	} );

} while ( 0 < difference.lineCountMoved - lastLineCountMoved );

return difference;

},



	},

	unmounted() {
		this.$store.commit("removePrompterID")
	},

	mounted() {
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
