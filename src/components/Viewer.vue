<template>
	<div class="flex-auto">
		<div>
			<span class="py-1 font-bold border-gray-300 rounded">{{ title }}</span>
			in <span class="py-1 border-gray-300 rounded">{{ language_name }}</span>

			<br>
			<br>
			<div
				class="w-full h-full py-1 border-gray-300 rounded viewer"
				:style="{ 'font-size': fontsize + 'px' }"
				style="overscroll-behavior:none; height: 47.5vh;"
				:ref="interpretation_id"
			>
				<span
					v-for="substring in arrayForRenderingHighlights"
					:key="substring.startingcharacter"
					:id="substring.highlighted"
				>

					<!-- style="scroll-margin-bottom: 23vh;" -->
					<!-- :ref="el => {functionRef(el)}" -->
					<span
						v-if="substring.scrollTo==0"
						class="cursor-pointer"
						@click="snapToTimestamp(substring)"
						style="white-space: pre-wrap"
					>{{ substring.text }}</span>
					<span
						v-else-if="substring.scrollTo==1"
						class="text-red-600"
						style="white-space: pre-wrap"
						@click="snapToTimestamp(substring)"
					>{{ substring.text }}</span>
					<span
						v-else-if="substring.scrollTo==2"
						class="text-blue-600"
						style="white-space: pre-wrap"
						@click="snapToTimestamp(substring)"
					>{{ substring.text }}</span>
					<span
						v-else-if="substring.scrollTo>=3"
						class="text-purple-800"
						style="white-space: pre-wrap"
						@click="snapToTimestamp(substring)"
					>{{ substring.text }}</span>

				</span>
			</div>

			<br />

			<br />
		</div>
	</div>
</template>

<script>
import { saveAs } from "file-saver";
import { getIdToken } from "firebase/auth";

export default {
	name: "Viewer",
	inheritAttrs: false,
	data: () => {
		return {
			language_name: "",
			title: "",
			srt: "",
			// currenthighlight: 0,
			// fontsizeoriginal: 12,
			relevantTimestamps: [],
			lastTimestamp: 0,
			nextTimestamp: 0,
			relevantCharacters: [], // character indices in the text where highlighting might need to begin or end
			parsedAssociations: [], // array of objects that each indicates which range of characters should be highlighted within a given range of milliseconds
			substringArray: [], // array of objects that each includes a substring of the displayed text, with the index of the substring's starting character
			latest_text: "", // the whole text to be displayed
			associations: null, // the raw data of associated milliseconds/characters to be highlighted, as sent from backend
			startslice: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			endslice: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			i: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			spaced_by: "",
		};
	},

	computed: {
		arrayForRenderingHighlights() {
			// we get a new one of these only every time the highlights need to change
			let tempArray = this.substringArray;
			let mappedParsedAssociations = this.parsedAssociations.map(
				(assoc) => assoc.startCharacter
			);
			let firstPassHighlightsArray = [];
			for (let i = 0; i < tempArray.length; i++) {
				let k = 0;
				this.parsedAssociations.forEach((element) => {
					if (
						this.lastTimestamp >= element.startTime &&
						this.lastTimestamp < element.endTime
					) {
						if (
							tempArray[i].startingcharacter >= element.startCharacter &&
							tempArray[i].startingcharacter < element.endCharacter
						) {
							k++;
						}
					}
				});

				tempArray[i].scrollTo = k; // tells us how many levels of highlight (= which color of highlight) to give that substring

				if (tempArray[i].scrollTo > 0) {
					// for each highlighted substring...
					tempArray[i].highlighted = 1;
					let temporaryindex = mappedParsedAssociations.indexOf(
						tempArray[i].startingcharacter
					);
					if (temporaryindex != -1) {
						firstPassHighlightsArray.push(
							// ...put it in another array
							this.parsedAssociations[temporaryindex]
						);
					}
				} else {
					tempArray[i].highlighted = 0;
				}
			}
			let mappedTempArray = tempArray.map((temp) => temp.startingcharacter);

			// console.log(firstPassHighlightsArray);
			// let toIncrease = []; // which ones should we give an extra nesting value?

			firstPassHighlightsArray.forEach((element) => {
				this.parsedAssociations.forEach((parsed) => {
					if (
						// make sure nested written meanings are at least highlighted a little bit even if their characters are out of order
						element.startTime <= parsed.startTime &&
						parsed.endTime <= element.endTime &&
						!(
							element.startCharacter <= parsed.startCharacter &&
							parsed.endCharacter <= element.endCharacter
						)
					) {
						let tempindex = mappedTempArray.indexOf(parsed.startCharacter);
						tempArray[tempindex].scrollTo = tempArray[tempindex].scrollTo + 1;
						tempArray[tempindex].highlighted = 1;
					}
					// if (
					// 	// highlight container meanings even if they're technically not relevant in the moment
					// 	parsed.startCharacter < element.startCharacter &&
					// 	element.endCharacter < parsed.endCharacter &&
					// 	!(
					// 		parsed.startTime < element.startTime &&
					// 		element.endTime < parsed.endTime
					// 	)
					// ) {
					// 	console.log(parsed);
					// 	for (let c = 0; c < tempArray.length; c++) {
					// 		if (
					// 			parsed.startCharacter <= tempArray[c].startingcharacter &&
					// 			tempArray[c].startingcharacter < parsed.endCharacter
					// 		) {
					// 			// console.log(tempArray[c].startingcharacter);
					// 			toIncrease.push(c);
					// 		}
					// 	}
					// }
				});
			});
			// toIncrease = [...new Set(toIncrease)]; // but don't give them more nesteds than they need!
			// console.log(toIncrease);

			// let p = 0;
			// toIncrease.forEach((c) => {
			// 	// and if everything's already highlighted once then don't turn it all into being highlighted twice!
			// 	if (tempArray[c].scrollTo != 1) {
			// 		p++;
			// 	}
			// });
			// if (p > 0) {
			// 	toIncrease.forEach((c) => {
			// 		tempArray[c].scrollTo = tempArray[c].scrollTo + 1;
			// 		tempArray[c].highlighted = 1;
			// 	});
			// }
			// console.log(containersToCheck)
			// containersToCheck.forEach(container => {
			// 	this.parsedAssociations.forEach(parsed => {
			// 		if (container.start<=parsed.startCharacter && parsed.endCharacter <= container.end) {
			// 			let tempindex = mappedTempArray.indexOf(parsed.startCharacter);
			// 			tempArray[tempindex].scrollTo = tempArray[tempindex].scrollTo + 1;
			// 			tempArray[tempindex].highlighted = 1;
			// 		}
			// 	})
			// })

			return tempArray;
		},
	},

	props: {
		audio_id: {
			default: "",
		},
		downloadSRTcounter: { default: 0 },
		timestep: { default: 0 },
		fontsize: { default: 12 },
		interpretation_id: { default: "" },
		interpretationStatus: { default: "" }, // describes whether the currently logged-in user is a viewer, editor, or owner of the interpretation being viewed
	},
	watch: {
		interpretationStatus: function () {
			// console.log("1");
			this.fetchNewInterpretation();
		},
		downloadSRTcounter: function () {
			// console.log("2");
			this.downloadSRT();
		},
		timestep: function () {
			// console.log("3");
			this.fetchNewInterpretation();
		},
		"$store.state.renewViewer": function () {
			// console.log("4");
			this.fetchNewInterpretation();
		},
		"$store.state.checkViewerHighlight": function () {
			this.rerenderHighlights();
		},
		"$store.state.audioplayertime": function () {
			this.rerenderHighlights();
			// if (this.$store.state.audioplayertime >= this.nextTimestamp)
			// {
			// 	this.lastTimestamp=this.nextTimestamp
			// 	//rerender DOM
			// 	if (this.nextTimestamp != this.$store.state.audioDuration)
			// 	{this.nextTimestamp=this.relevantTimestamps[this.relevantTimestamps.indexOf(this.nextTimestamp)+1]}
			// 	else {this.nextTimestamp = 0}
			// }
			// if (this.$store.state.audioplayertime < this.lastTimestamp)
			// {}
			// if (
			// 	this.$store.state.audioplayertime < this.lastTimestamp ||
			// 	this.$store.state.audioplayertime > this.nextTimestamp
			// ) {
			// 	console.log("6");
			// 	let currenttime = this.$store.state.audioplayertime;
			// 	// REPOPULATE TIMESTAMPS
			// 	for (let i = 0; i < this.relevantTimestamps.length; i++) {
			// 		if (
			// 			this.relevantTimestamps[i] <= currenttime &&
			// 			this.relevantTimestamps[i + 1] > currenttime
			// 		) {
			// 			this.lastTimestamp = this.relevantTimestamps[i];
			// 			this.nextTimestamp = this.relevantTimestamps[i + 1];
			// 			break;
			// 		}
			// 	}

			// 	this.scrollToElement(this.targetId);
			// }
		},
		// currenthighlight: function () {
		// if (this.$refs.highlightedwords && this.fontsize <= 16) {
		// 	// this.$nextTick(() => {
		// 	this.$refs.highlightedwords[this.currenthighlight].scrollIntoView({
		// 		block: "start",
		// 	});
		// 	// });
		// }
		// },
	},
	mounted() {
		// this.fontsizeoriginal=this.fontsize
		if (this.interpretationStatus) {
			this.fetchNewInterpretation();
		}
	},
	updated() {
		this.scrollToElement(1);
	},

	methods: {
		// functionRef(el) {
		// 	console.log(el)
		// },

		rerenderHighlights() {
			// basically always running if audio player is doing anything
			if (
				this.$store.state.audioplayertime < this.lastTimestamp ||
				this.$store.state.audioplayertime > this.nextTimestamp
			) {
				let currenttime = this.$store.state.audioplayertime;
				// REPOPULATE TIMESTAMPS
				for (let i = 0; i < this.relevantTimestamps.length; i++) {
					if (
						this.relevantTimestamps[i] <= currenttime &&
						this.relevantTimestamps[i + 1] > currenttime
					) {
						this.lastTimestamp = this.relevantTimestamps[i];
						this.nextTimestamp = this.relevantTimestamps[i + 1];
						break;
					}
				}
			}
		},

		scrollToElement(number) {
			// console.log(number);
			// console.log(this.arrayForRenderingHighlights);
			// console.log(
			// 	this.$refs[this.interpretation_id].querySelector(
			// 		`#${CSS.escape(number)}`
			// 	)
			// );
			// console.log(this.$store.state.consoles.length);

			if (
				this.$refs[this.interpretation_id].querySelector(
					`#${CSS.escape(number)}`
				) !== null
			) {
				if (this.$store.state.consoles.length == 1) {
					// console.log("in scroll smooth");
					this.$refs[this.interpretation_id]
						.querySelector(`#${CSS.escape(number)}`)
						.scrollIntoView({ behavior: "smooth", block: "start" });
				} else {
					this.$refs[this.interpretation_id]
						.querySelector(`#${CSS.escape(number)}`)
						.scrollIntoView({ block: "start" });
					// console.log("in scroll instant");
				}
			} else {
				this.$nextTick(() => {
					if (
						this.$refs[this.interpretation_id].querySelector(
							`#${CSS.escape(number)}`
						) !== null
					) {
						if (this.$store.state.consoles.length == 1) {
							// console.log("in scroll smooth");
							this.$refs[this.interpretation_id]
								.querySelector(`#${CSS.escape(number)}`)
								.scrollIntoView({ behavior: "smooth", block: "start" });
						} else {
							this.$refs[this.interpretation_id]
								.querySelector(`#${CSS.escape(number)}`)
								.scrollIntoView({ block: "start" });
							// console.log("in scroll instant");
						}
					}
				});
			}
		},

		// access the interpretation that needs to be displayed
		async fetchNewInterpretation() {
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

			const apiUrl =
				process.env.VUE_APP_api_URL +
				"interpretations/" +
				this.interpretation_id +
				"/audio/" +
				this.audio_id +
				"/" +
				this.interpretationStatus +
				"/";
			fetch(apiUrl, {
				method: "GET",

				headers: {
					"Content-Type": "application/json",

					Authorization: this.$store.state.idToken,
				},
			})
				.then((response) => response.json())
				.then((data) => {
					this.title = data.interpretation.title;
					this.language_name = data.interpretation.language_name;
					this.latest_text = data.interpretation.latest_text;
					this.spaced_by = data.interpretation.spaced_by;
				})

				// access the information about what to highlight, and when, for the interpretation that is to be displayed
				.then(() => {
					// console.log(this.timestep)

					fetch(
						process.env.VUE_APP_api_URL +
							"content/" +
							this.audio_id +
							"/" +
							this.interpretation_id +
							"/" +
							this.timestep +
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
							this.associations = data.associations;
						})
						.then(() => this.parsed_associations()) // turn the highlighting information from backend into something usable
						.then(() => {
							this.latest_text_slices(); // split up the displayed text into substrings to be highlighted whenever necessary
						})
						.catch((error) => console.error("Error:", error));
				})

				.catch((error) => console.error("Error:", error));
		},

		parsed_associations: function () {
			this.parsedAssociations.length = 0;
			if (this.associations) {
				for (let i = 0; i < Object.keys(this.associations).length; i++) {
					let startTime = Object.keys(this.associations)[i].split("-")[0];
					let endTime = Object.keys(this.associations)[i].split("-")[1];
					let intervalsCount = Object.values(this.associations)[i].length;

					for (let j = 0; j < intervalsCount; j++) {
						let startCharacter = Object.values(this.associations)[i][j].split(
							"-"
						)[0];
						let endCharacter = Object.values(this.associations)[i][j].split(
							"-"
						)[1];

						let associationsObject = {};
						associationsObject.startTime = Number(startTime);
						associationsObject.endTime = Number(endTime);

						associationsObject.startCharacter = Number(startCharacter);
						associationsObject.endCharacter = Number(endCharacter) + 1;
						this.parsedAssociations.push(associationsObject);
					}
				}
			}
		},

		downloadSRT() {
			this.srt = "";

			this.parsedAssociations.sort((a, b) => a.endCharacter - b.endCharacter);
			let captionNumber = 0;
			this.substringArray.forEach((value, index) => {
				// console.log(this.populateSRT(value.startingcharacter));
				let info = this.populateSRT(value.startingcharacter);
				// console.log(info);

				if (Object.keys(info).length > 0) {
					// console.log("HIT");
					let tempStartTimeMilliseconds = info.startTime.slice(-2) + "0";
					while (tempStartTimeMilliseconds.length < 3) {
						tempStartTimeMilliseconds += 0;
					}
					let tempStartTimeSeconds = this.secondsToTime(
						info.startTime.slice(0, -2)
					);
					let tempEndTimeMilliseconds = info.endTime.slice(-2) + "0";
					while (tempEndTimeMilliseconds.length < 3) {
						tempEndTimeMilliseconds += 0;
					}
					let tempEndTimeSeconds = this.secondsToTime(
						info.endTime.slice(0, -2)
					);
					let tempSubstring = value.text;
					// console.log(tempSubstring)
					let tempSubstringSplit = tempSubstring.split("");
					tempSubstringSplit.forEach((character, index) => {
						if (character === "\n") {
							tempSubstringSplit[index] = this.spaced_by;
						}
					});

					tempSubstring = tempSubstringSplit.join("");
					// console.log(tempSubstring)

					if (this.spaced_by != "") {
						let tempSubstringArray = tempSubstring.split("\\n");
						for (let j = 0; j < tempSubstringArray.length; j++) {
							if (tempSubstringArray[j][0] == this.spaced_by) {
								tempSubstringArray[j] = tempSubstringArray[j].substring(1);
							}
							if (
								tempSubstringArray[j][tempSubstringArray[j].length - 1] ==
								this.spaced_by
							) {
								tempSubstringArray[j] = tempSubstringArray[j].substring(
									0,
									tempSubstringArray[j].length - 1
								);
							}
						}

						// console.log(stripped.join("\n"));
						tempSubstring = tempSubstringArray.join("\\n");
						// console.log(tempSubstring)
					}

					captionNumber++;

					this.srt +=
						captionNumber +
						"\n" +
						tempStartTimeSeconds +
						"," +
						tempStartTimeMilliseconds +
						" --> " +
						tempEndTimeSeconds +
						"," +
						tempEndTimeMilliseconds +
						"\n" +
						tempSubstring +
						"\n\n";
				}
			});
			// console.log(this.srt)
			if (this.srt.slice(-2) == "\n\n") {
				this.srt = this.srt.slice(0, -2);
			}

			let blob = new Blob([this.srt], { type: "text/plain;charset=utf-8" });
			saveAs(
				blob,
				this.title +
					"-" +
					this.language_name +
					"-timestep" +
					this.timestep +
					".srt"
			);
		},

		// getTempSubstring(startcharacter) {
		// 	let tempSubstring = "";
		// 	this.substringArray.forEach((substring) => {
		// 		if (substring.startingcharacter == startcharacter) {
		// 			tempSubstring = substring.text;
		// 		}
		// 	});

		// 	return tempSubstring;
		// },

		// convert a value from seconds to HH:MM:SS
		secondsToTime(seconds) {
			var date = new Date(1970, 0, 1);
			date.setSeconds(seconds);
			return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		},

		async latest_text_slices() {
			this.substringArray = [];
			this.relevantCharacters.length = 0;
			await this.assignRelevantCharacters();
			// console.log(this.relevantCharacters)

			// console.log(this.relevantTimestamps);
			if (this.relevantCharacters.length > 0) {
				this.relevantCharacters.sort((a, b) => a - b);
				this.relevantCharacters = [...new Set(this.relevantCharacters)];

				if (this.relevantCharacters[0] != 0) {
					let firstslice = {};
					this.endslice = this.relevantCharacters[0];
					firstslice.text = this.latest_text.substring(0, this.endslice);
					firstslice.startingcharacter = 0;
					this.substringArray.push(firstslice);
				}

				this.i = 0;
				while (this.i + 1 < this.relevantCharacters.length) {
					let slice = {};
					this.startslice = this.relevantCharacters[this.i];
					this.endslice = this.relevantCharacters[this.i + 1];
					slice.text = this.latest_text.substring(
						this.startslice,
						this.endslice
					);
					slice.startingcharacter = this.startslice;
					this.substringArray.push(slice);
					this.i++;
				}
				let finalslice = {};
				this.startslice = this.relevantCharacters[this.i];
				finalslice.text = this.latest_text.substring(this.startslice);
				finalslice.startingcharacter = this.startslice;
				this.substringArray.push(finalslice);
			} else {
				let slice = {};
				slice.text = this.latest_text;
				slice.startingcharacter = 0;
				this.substringArray.push(slice);
			}

			// console.log(this.relevantTimestamps.length);
			// let tempParsedAssociations = this.parsedAssociations.map(
			// 	(element) => element.endCharacter
			// );
			// let startTimeParsedAssociations = this.parsedAssociations.map(
			// 	(element) => element.startTime
			// );
			// let endTimeParsedAssociations = this.parsedAssociations.map(
			// 	(element) => element.endTime
			// );
			// this.substringArray.forEach((element) => {
			// 	if (
			// 		element.text == "\n\n" ||
			// 		// element.text == this.spaced_by ||
			// 		element.text == ""
			// 	) {
			// 		// console.log(element);
			// 		if (tempParsedAssociations.indexOf(element.startingcharacter) != -1) {
			// 			let timeToRemove =
			// 				this.parsedAssociations[
			// 					tempParsedAssociations.indexOf(element.startingcharacter)
			// 				].endTime;
			// 			// console.log(timeToRemove);
			// 			if ((startTimeParsedAssociations.indexOf(timeToRemove) == -1) && (endTimeParsedAssociations.indexOf(timeToRemove) == -1)) {
			// 				// only remove the timestamp if it's not relevant for starting a different important block of text
			// 				this.relevantTimestamps.splice(
			// 					this.relevantTimestamps.indexOf(timeToRemove),
			// 					1
			// 				);
			// 			}
			// 		}
			// 	}
			// });

			// console.log(this.relevantTimestamps.length);
			// // console.log(this.relevantTimestamps)

			this.rerenderHighlights();
			// console.log(this.substringArray)
			// console.log(this.parsedAssociations)
			// this.substringArray.forEach((element) => {highlight(element.startingcharacter)})
		},

		// this is a helper function that helps decide at which character indices to break the text into substrings
		assignRelevantCharacters() {
			// console.log(this.associations)
			Object.values(this.associations).forEach((element) => {
				// for each character substring
				for (let i = 0; i < element.length; i++) {
					let startCharacter = parseInt(element[i].split("-")[0]);
					let endCharacter = parseInt(element[i].split("-")[1]) + 1;
					this.relevantCharacters.push(startCharacter);
					this.relevantCharacters.push(endCharacter);
				}
			});
			// console.log(Object.keys(this.associations))
			Object.keys(this.associations).forEach((element) => {
				// for each character substring
				for (let i = 0; i < element.length; i++) {
					let startTimestamp = parseInt(element.split("-")[0]);
					let endTimestamp = parseInt(element.split("-")[1]);
					this.relevantTimestamps.push(startTimestamp);
					this.relevantTimestamps.push(endTimestamp);
				}
			});
			this.relevantTimestamps.push(0);
			this.relevantTimestamps.push(this.$store.state.audioDuration); // i probably need to divide this by some multiple of 10 though FLAG

			this.relevantTimestamps.sort((a, b) => a - b);
			this.relevantTimestamps = [...new Set(this.relevantTimestamps)];
		},

		// highlight(startingcharacter) {
		// 	let k = 0;
		// 	// console.log(startingcharacter)
		// 	// console.log(this.parsedAssociations)
		// 	this.parsedAssociations.forEach((element, elementindex) => {
		// 		if (
		// 			this.lastTimestamp >= element.startTime &&
		// 			this.lastTimestamp < element.endTime
		// 		) {
		// 			if (
		// 				startingcharacter >= element.startCharacter &&
		// 				startingcharacter < element.endCharacter
		// 			) {
		// 				k++;
		// 				// this.currenthighlight = elementindex;
		// 			}
		// 		}
		// 	});

		// if (this.$refs.highlightedwords) {
		// 		if (this.$refs.highlightedwords.length > 0) {
		// 			this.$refs.highlightedwords[this.currenthighlight].scrollIntoView({behavior: "smooth", block: "center"});
		// 			// console.log(this.$refs.highlightedwords[20])
		// 		}

		// }
		// console.log(k)
		// 	return k; // any value of k greater than 0 will cause the substring to be highlighted at this moment in the audio player time
		// },

		populateSRT(startingcharacter) {
			let tempassociation = {};
			for (let i = 0; i < this.parsedAssociations.length; i++) {
				if (
					startingcharacter >= this.parsedAssociations[i].startCharacter &&
					startingcharacter < this.parsedAssociations[i].endCharacter
				) {
					tempassociation.startCharacter =
						this.parsedAssociations[i].startCharacter;
					tempassociation.endCharacter =
						this.parsedAssociations[i].endCharacter;
					tempassociation.startTime = String(
						this.parsedAssociations[i].startTime
					);
					tempassociation.endTime = String(this.parsedAssociations[i].endTime);
					break;
				}
			}
			return tempassociation;
		},

		// 				calculateScrollTopMargin(substring) {
		// 		// //return pixels to offset
		// 		// 			((6 * this.latest_text_unstripped.length) /
		// 		//           (this.$store.state.consoleswidth - 570)) *
		// 		//           this.$store.state.consoles.length +
		// 		//         this.numbernewlines

		// 		// 			let calculated=(this.fontsize*(substring.startingcharacter+this.welcometext.length) /
		// 		//           (this.$store.state.consoleswidth - 570)) *
		// 		//           this.$store.state.consoles.length +60+(8*(substring.text.match(/\n/g) || []).length))
		// 		// 			console.log(calculated)
		// let calculated=500
		// // if (this.fontsize>this.fontsizeoriginal) {
		// // 					calculated=this.fontsize/this.fontsizeoriginal*(-50)

		// // 					console.log(calculated)}
		// 					return calculated
		// 				},

		snapToTimestamp(substring) {
			// console.log(substring)
			let startingcharacter = substring.startingcharacter;
			// let text=substring.text
			// console.log(startingcharacter);
			// console.log(text)
			let potentialSnapArray = [];
			this.parsedAssociations.forEach((element) => {
				if (
					startingcharacter >= element.startCharacter &&
					startingcharacter < element.endCharacter
				) {
					potentialSnapArray.push(element);
					// console.log(element)
				}
			});
			potentialSnapArray.sort(
				(a, b) =>
					b.endCharacter -
					b.startCharacter -
					(a.endCharacter - a.startCharacter)
			);
			let playFromTimestamp =
				potentialSnapArray[potentialSnapArray.length - 1].startTime / 100;
			// console.log(playFromTimestamp)
			if (playFromTimestamp || playFromTimestamp === 0) {
				// console.log(playFromTimestamp)
				// console.log(startingcharacter);
				// console.log(text)
				let params = {
					timestamp: playFromTimestamp,
					timestampEnd:
						potentialSnapArray[potentialSnapArray.length - 1].endTime / 100,
					// "text": text
				};
				this.$store.commit("updateIncomingCurrentTime", params);
			}
			potentialSnapArray.length = 0;
		},
	},
};
</script>

<style scoped>
.viewer {
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;
}

.viewer::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}
</style>