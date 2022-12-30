

<template>
	<slot></slot>
	<div class="flex-auto">

		<span class="py-1 font-bold border-gray-300 rounded">{{ title }}</span>
		in <span class="py-1 border-gray-300 rounded ">{{ language_name }}</span><br />

		<!-- {{parsedAssociations}}<br><br> -->
		<!-- {{substringArray}}<br><br> -->
		<!-- {{phrasechoicesArray}}<br> -->
		<!-- {{$store.state.startTimePrompter}}<br>
		{{$store.state.endTimePrompter}}<br> -->

		<div class="w-full h-full py-[1vh] border-gray-300 rounded">

			<div
				class="-mt-[2vh] pb-[2vh]"
				v-if="substringArray.length>0"
			>
				<span
					style="white-space: pre-wrap"
					:style="{ 'font-size': fontsize + 'px' }"
				>
					<p @click="chooseanswer(phrasechoicesArray[0])"> 1. {{ phrasechoicesArray[0] }}</p>
					<p @click="chooseanswer(phrasechoicesArray[1])"> 2. {{ phrasechoicesArray[1] }}</p>
					<p @click="chooseanswer(phrasechoicesArray[2])"> 3. {{ phrasechoicesArray[2] }}</p>
					<p @click="chooseanswer(phrasechoicesArray[3])"> 4. {{ phrasechoicesArray[3] }}</p>
				</span>
			</div>
		</div>

		<textarea
			class="w-full h-full px-3 py-1 border-gray-300 rounded studio"
			:style="{ 'font-size': fontsize + 'px' }"
			style="overflow: scroll; height:22vh;"
			placeholder="enter new text here"
			v-model="new_text_unstripped"
			ref="promptertextarea"
		></textarea>
		<div
			class="flex flex-row justify-center w-full"
			v-if="finished==true"
		>
			<div><button class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn">Visit Another Storybook (not working yet)</button></div>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	inheritAttrs: false,
	name: "Studio",
	data: () => {
		return {
			new_text_unstripped: "",
			language_name: "",
			title: "",
			latest_text: "",
			phrasechoicesArray: [],
			substringindex: null,
			finished: false,
			spaced_by: "",
			associations: null,
			parsedAssociations: [], // array of objects that each indicates which range of characters should be highlighted within a given range of milliseconds
			substringArray: [], // array of objects that each includes a substring of the displayed text, with the index of the substring's starting character
			startslice: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			endslice: 0, // helper variable for latest_text_slices function, never accessed outside of that function
			i: 0, // helper variable for latest_text_slices function, never accessed outside of that function
		};
	},
	computed: {
		new_text() {
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
			if (this.$store.state.audioDuration < this.studying) {
				return this.$store.state.audioDuration;
			} else {
				return this.studying;
			}
		},

		regexwithspacedby() {
			return new RegExp(`${this.escapeRegex(this.spaced_by)}|(\n)`);
		},

		regexwithmultiplespacedby() {
			return new RegExp(`${this.escapeRegex(this.spaced_by)}+`, "g");
		},
	},
	props: {
		// ID of associated audio file
		audio_id: {
			default: "",
		},
		studying: {
			default: 200,
		},
		newPhrasescounter: {
			default: 0,
		},
		fontsize: { default: 12 },

		// ID of interpretation displayed in this Editor
		interpretation_id: { default: "" },

		// whether the interpretation is owned "owner", editable "editor", or only viewable "viewer" by the logged-in user
		interpretationStatus: { default: "" },
	},
	watch: {
		interpretationStatus: function () {
			this.fetchNewInterpretation();
		},

		scribingclean: function () {
			this.fetchNewInterpretation();
		},

		new_text: function () {
			if (this.substringArray.length >= 1) {
				if (this.new_text == this.substringArray[this.substringindex].text) {
					this.new_text_unstripped = "";
					this.$emit("increasePhrasesCounter");
				}
			}
		},

		"substringArray.length": function () {
			if (
				this.substringArray.length > 0 &&
				this.$store.state.audioDuration > 0
			) {
				this.substringindex = 0;
			}
		},

		"$store.state.audioDuration": function () {
			if (
				this.substringArray.length > 0 &&
				this.$store.state.audioDuration > 0
			) {
				this.substringindex = 0;
			}
		},

		newPhrasescounter: function () {
			if (
				this.substringArray.length > 0 &&
				this.$store.state.audioDuration > 0
			) {
				if (this.substringindex < this.substringArray.length - 1) {
					this.substringindex++;
				} else if (this.substringindex == this.substringArray.length - 1) {
					this.substringindex = 0;
					this.finished = true;
				}
				this.new_text_unstripped = "";
			}
		},

		substringindex: function () {
			//if the audio player has loaded and the text has been divided into substrings already, then focus on the textbox
			if (
				this.$store.state.audioDuration > 0 &&
				this.substringArray.length > 0
			) {
				// console.log(this.substringArray[this.substringindex].text);
				this.phrasechoicesArray=[]
				//populate answers array
				this.phrasechoicesArray = [
					this.substringArray[this.substringindex].text,
					this.substringArray[
						Math.floor(Math.random() * this.substringArray.length)
					].text,
					this.substringArray[
						Math.floor(Math.random() * this.substringArray.length)
					].text,
					this.substringArray[
						Math.floor(Math.random() * this.substringArray.length)
					].text,
				];

				this.$store.commit(
					"updateStartTimePrompter",
					this.substringArray[this.substringindex].starttime / 100
				);
				this.$store.commit(
					"updateEndTimePrompter",
					this.substringArray[this.substringindex].endtime / 100
				);

				this.$store.commit("forceRegionRerender");

				// randomize answers array
				for (let j = this.phrasechoicesArray.length - 1; j > 0; j--) {
					var h = Math.floor(Math.random() * (j + 1));
					var temp = this.phrasechoicesArray[j];
					this.phrasechoicesArray[j] = this.phrasechoicesArray[h];
					this.phrasechoicesArray[h] = temp;
				}

				this.$refs.promptertextarea.focus();
			}
		},
	},
	methods: {
		chooseanswer(answer) {
			if (this.interpretationStatus=="owner" || this.interpretationStatus=="editor")
			{this.new_text_unstripped = answer;}
		},

		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

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

			this.new_text_unstripped = "";
			this.phrasechoicesArray = [];
			this.substringindex = null;
			this.associations = null;
			this.parsedAssociations = [];
			this.substringArray = [];

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
					this.spaced_by = data.interpretation.spaced_by;
				})

				// access the information about what to highlight, and when, for the interpretation that is to be displayed
				.then(() => {
// console.log(this.scribingclean)

					fetch(
						process.env.VUE_APP_api_URL +
							"content/" +
							this.audio_id +
							"/" +
							this.interpretation_id +
							"/" +
							this.scribingclean + // FLAG TIME DECISION
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

		latest_text_slices() {
			this.substringArray = [];
			if (this.parsedAssociations.length > 1) {
			// console.log("here")
				this.i = 0;
				while (this.i + 1 <= this.parsedAssociations.length) {
					let slice = {};
					this.startslice = this.parsedAssociations[this.i].startCharacter;
					this.endslice = this.parsedAssociations[this.i].endCharacter;
					slice.starttime = this.parsedAssociations[this.i].startTime;
					slice.endtime = this.parsedAssociations[this.i].endTime;
					slice.text = this.latest_text.substring(
						this.startslice,
						this.endslice
					);
					slice.startingcharacter = this.startslice;
					this.substringArray.push(slice);
					this.i++;
				}
// console.log(this.substringArray)
let indicesToDelete=[]
				// delete the ones whose timestamps completely surround another one
				let y = 0;
				while (y < this.substringArray.length) {
					// this is the one that we are checking against
					let checkExteriorStart = parseInt(this.substringArray[y].starttime);
					let checkExteriorEnd = parseInt(this.substringArray[y].endtime);
					let z = 0;
					while (z < this.substringArray.length) {
						if (
							// if this one is exterior to the other one, then delete it
							parseInt(this.substringArray[z].endtime) >= checkExteriorEnd &&
							parseInt(this.substringArray[z].starttime) <= checkExteriorStart && y != z
						) {
					// console.log(this.substringArray[y])
					// 	console.log(this.substringArray[z])
							indicesToDelete.push(z)
							// console.log("deleting inner")
						} else if (
							// if this one is interior to the other one, then break this while loop, delete the other one and do not index the other one's loop
							parseInt(this.substringArray[z].endtime) <= checkExteriorEnd &&
							parseInt(this.substringArray[z].starttime) >= checkExteriorStart && y != z
						) {
							// delete exterior one
					// console.log(this.substringArray[y])
					// 	console.log(this.substringArray[z])
							indicesToDelete.push(z)
							// console.log("deleting outer")
							indicesToDelete.push(y)
							break;
						} // no match; nothing gets deleted; index inner while loop
							z++;
					}
					y++;
				}
				// console.log(indicesToDelete)
				indicesToDelete = [...new Set(indicesToDelete)]
				// console.log(indicesToDelete)
				for (let t = indicesToDelete.length-1; t >= 0; t--)
				{this.substringArray.splice(indicesToDelete[t],1)
				}
				
				// console.log(this.substringArray)
			} else if (this.parsedAssociations.length == 1) {
				let slice = {};
				slice.text = this.latest_text;
				slice.startingcharacter = 0;
				slice.starttime = 0;
				slice.endtime = this.$store.state.audioDuration;
				this.substringArray.push(slice);
			}
		},
	},

	unmounted() {
		if (
				this.$store.state.prompterID == this.interpretation_id
			) {
		this.$store.commit("removePrompterID");
							}
	},

	mounted() {
		this.parsedAssociations.length=0
		if (this.interpretationStatus) {
			this.fetchNewInterpretation();
		}
	},
};
</script>


<style scoped>
.studio {
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;
}

.studio::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}

.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 1vh 1vh;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	/* margin: 4px 2px; */
	cursor: pointer;
	border-radius: 16px;
}
</style>