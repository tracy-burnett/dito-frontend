<template>
	<div
		class="flex-auto"
		:style="{ 'font-size': fontsize + 'px' }"
	>
		<div>
			<span class="px-3 py-1 font-bold border-gray-300 rounded">{{ title }}</span>
			in <span class="px-3 py-1 border-gray-300 rounded">{{ language_name }}</span>

			<br><br>
			Change the slider above that says "highlight less / more".<br>
			When the text below is highlighted in phrases of a length that you like, then click "Download."<br><br>
			<!-- {{associations}}<br><br>
			{{parsedAssociations}}<br><br>
			{{substringArray}}<br><br> -->
			<!-- for each substring that would be independently highlighted, render it as highlighted or not based on running the highlight function on it whenever the current audioplayer time changes.
also, if the user clicks on the text of that substring, snap the audio player to play the corresponding audio for that substring. -->
			<div class="w-full h-full px-3 py-1 mt-12 mb-3 border-gray-300 rounded">
				<span
					v-for="substring in substringArray"
					:key="substring.startingcharacter"
				>
					<span
						v-if="highlight(substring.startingcharacter)"
						class="text-red-600"
						style="white-space: pre-wrap"
						@click="snapToTimestamp(substring.startingcharacter)"
					>{{ substring.text }}</span>
					<span
						v-else
						@click="snapToTimestamp(substring.startingcharacter)"
						style="white-space: pre-wrap"
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

export default {
	name: "Viewer",
	inheritAttrs: false,
	data: () => {
		return {
			language_name: "",
			title: "",
			srt: "",
			relevantCharacters: [], // character indices in the text where highlighting might need to begin or end
			parsedAssociations: [], // array of objects that each indicates which range of characters should be highlighted within a given range of milliseconds
			substringArray: [], // array of objects that each includes a substring of the displayed text, with the index of the substring's starting character
			latest_text: "", // the whole text to be displayed
			associations: null, // the raw data of associated milliseconds/characters to be highlighted, as sent from backend
			startslice: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			endslice: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			i: 0, // helper variable for latest_text_slices function, never accessed outside of that function
		};
	},

	props: {
		audio_id: {
			default: "",
		},
		downloadSRTcounter: { default: 0 },
		timestep: { default: 500 },
		fontsize: { default: 12 },
		interpretation_id: { default: "" },
		interpretationStatus: { default: "" }, // describes whether the currently logged-in user is a viewer, editor, or owner of the interpretation being viewed
	},
	watch: {
		interpretationStatus: function () {
			this.fetchNewInterpretation();
		},
		downloadSRTcounter: function () {
			this.downloadSRT();
		},
		timestep: function () {
			this.fetchNewInterpretation();
		},
	},
	mounted() {
		if (this.interpretationStatus) {
			this.fetchNewInterpretation();
		}
	},

	methods: {
		// access the interpretation that needs to be displayed
		fetchNewInterpretation() {
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
						associationsObject.startTime = startTime;
						associationsObject.endTime = endTime;

						associationsObject.startCharacter = startCharacter;
						associationsObject.endCharacter = Number.parseInt(endCharacter) + 1;
						this.parsedAssociations.push(associationsObject);
					}
				}
			}
		},

		downloadSRT() {
			this.parsedAssociations.forEach((value, index) => {
				let tempStartTimeMilliseconds = value.startTime.slice(-2) + "0";
				let tempStartTimeSeconds = this.secondsToTime(
					value.startTime.slice(0, -2)
				);
				let tempEndTimeMilliseconds = value.endTime.slice(-2) + "0";
				let tempEndTimeSeconds = this.secondsToTime(value.endTime.slice(0, -2));
				let tempSubstring = this.getTempSubstring(value.startCharacter);
console.log(tempSubstring)
				let tempSubstringSplit = tempSubstring.split('')
				tempSubstringSplit.forEach((character,index) => {
					if (character==="\n") {
						tempSubstringSplit[index]="\\n"
				}})

				tempSubstring=tempSubstringSplit.join('')

				this.srt +=
					index +
					1 +
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
			});
			// console.log(this.srt)

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

		getTempSubstring(startcharacter) {
			let tempSubstring = "";
			this.substringArray.forEach((substring) => {
				if (substring.startingcharacter == startcharacter) {
					tempSubstring = substring.text;
				}
			});

			return tempSubstring;
		},

		// convert a value from seconds to HH:MM:SS
		secondsToTime(seconds) {
			var date = new Date(1970, 0, 1);
			date.setSeconds(seconds);
			return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
		},

		latest_text_slices() {
			this.substringArray = [];
			this.relevantCharacters.length = 0;
			this.assignRelevantCharacters();
			if (this.relevantCharacters.length > 0) {
				this.relevantCharacters.sort((a, b) => a - b);
				this.relevantCharacters = [...new Set(this.relevantCharacters)];

				let firstslice = {};
				this.endslice = this.relevantCharacters[0];
				firstslice.text = this.latest_text.substring(0, this.endslice);
				firstslice.startingcharacter = 0;
				this.substringArray.push(firstslice);

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
		},

		// this is a helper function that helps decide at which character indices to break the text into substrings
		assignRelevantCharacters() {
			Object.values(this.associations).forEach((element) => {
				// for each character substring
				for (let i = 0; i < element.length; i++) {
					let startCharacter = parseInt(element[i].split("-")[0]);
					let endCharacter = parseInt(element[i].split("-")[1]) + 1;
					this.relevantCharacters.push(startCharacter);
					this.relevantCharacters.push(endCharacter);
				}
			});
		},

		highlight(startingcharacter) {
			let k = 0;
			this.parsedAssociations.forEach((element) => {
				if (
					this.$store.state.audioplayertime >= element.startTime &&
					(this.$store.state.audioplayertime < element.endTime ||
						element.endTime == "end")
				) {
					if (
						startingcharacter >= element.startCharacter &&
						startingcharacter < element.endCharacter
					) {
						k++;
					}
				}
			});
			return k; // any value of k greater than 0 will cause the substring to be highlighted at this moment in the audio player time
		},

		snapToTimestamp(startingcharacter) {
			let potentialSnapArray = [];
			this.parsedAssociations.forEach((element) => {
				if (
					startingcharacter >= element.startCharacter &&
					startingcharacter < element.endCharacter
				) {
					potentialSnapArray.push(element.startTime);
				}
			});
			potentialSnapArray.sort((a, b) => a - b);
			let playFromTimestamp =
				potentialSnapArray[potentialSnapArray.length - 1] / 100;
			if (playFromTimestamp) {
				this.$store.commit("updateIncomingCurrentTime", playFromTimestamp);
			}
			potentialSnapArray.length = 0;
		},
	},
};
</script>
