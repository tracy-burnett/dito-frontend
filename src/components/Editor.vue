<template>
	<slot></slot>
	<div
		class="flex-auto"
	>
		<!-- {{title.length}} -->
		<!-- {{$store.getters.maxsize}} -->
		Edit the title, language name, or text of the interpretation.  We will make every attempt to preserve the timestamps of the words as you move them around.
		<br>Don't forget to click the "Save" button above after you make your changes!<br>
		<br>
		<input
			class="px-3 py-1 font-bold border-gray-300 rounded"
			v-model="title"
			:size="titlesize"
		/>
		in
		<input
			class="h-full px-3 py-1 border-gray-300 rounded"
			v-model="language_name"
			:size="languagesize"
		/>
		<textarea
			class="w-full border-gray-300 rounded editor"

		style="overflow: scroll; height:50vh;"
		:style="{ 'font-size': fontsize + 'px' } "
			v-model="latest_text_unstripped"
		></textarea>
		<!-- {{latest_text.length}}
{{$store.state.consoleswidth}}
{{$store.state.consoles.length}} -->

	</div>
</template>

<script>
export default {
	name: "Editor",
	inheritAttrs: false,
	data: () => {
		return {
			language_name: "",
			title: "",
			latest_text_unstripped: "",
			original_text: "",
			spaced_by: "",
		};
	},
	computed: {
		latest_text() {
			if (this.spaced_by != "") {
				let stripped = this.latest_text_unstripped.replace(
					this.regexwithmultiplespacedby,
					this.spaced_by
				);
				return stripped;
			} else if (this.spaced_by == "") {
				return this.latest_text_unstripped;
			}
		},

		regexwithmultiplespacedby() {
			return new RegExp(`${this.escapeRegex(this.spaced_by)}+`, "g");
		},

		numbernewlines() {
			return this.latest_text_unstripped.split(/\r\n|\r|\n/).length;
		},

		titlesize() {
			if (
				this.title.length > 3 &&
				this.title.length < this.$store.getters.maxsize
			) {
				return this.title.length * 1.13 - 3;
			} else if (this.title.length >= this.$store.getters.maxsize) {
				return this.$store.getters.maxsize;
			} else {
				return 1;
			}
		},
		languagesize() {
			if (
				this.language_name.length > 4 &&
				this.language_name.length < this.$store.getters.maxsize
			) {
				return this.language_name.length * 1.27 - 4;
			} else if (this.title.length >= this.$store.getters.maxsize) {
				return this.$store.getters.maxsize;
			} else {
				return 1;
			}
		},

		// latesttextrows() {
		// 	return (
		// 		((6 * this.latest_text_unstripped.length) /
		// 			(this.$store.state.consoleswidth - 570)) *
		// 			this.$store.state.consoles.length +
		// 		this.numbernewlines
		// 	);
		// },
	},
	props: {
		// ID of associated audio file
		audio_id: {
			default: "",
		},
		saveEditscounter: {
			default: 0,
		},

		fontsize: { default: 12 },

		// ID of interpretation displayed in this Editor
		interpretation_id: { default: "" },

		// whether the interpretation is owned "owner", editable "editor", or only viewable "viewer" by the logged-in user
		interpretationStatus: { default: "" },
	},
	watch: {
		saveEditscounter: function () {
			this.updateText();
		},
	},
	methods: {
		// destroy an interpretation with no text, title, or language name
		permanentlydelete() {
			this.$emit("permanentlydestroy", this.interpretation_id);
		},

		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		// edit the text when the user clicks "Save Edits"
		updateText() {
			let regexwithspacedby = new RegExp(
				`${this.escapeRegex(this.spaced_by)}|(\n)`
			);

			let original_text_cleaned = this.original_text.split(regexwithspacedby); // not cleaned yet, but about to be
			let latest_text_cleaned = this.latest_text
				.normalize("NFC")
				.split(regexwithspacedby); // not cleaned yet, but about to be

			for (let j = original_text_cleaned.length; j >= 0; j--) {
				if (
					original_text_cleaned[j] === undefined ||
					original_text_cleaned[j] == ""
				) {
					original_text_cleaned.splice(j, 1);
				} // second parameter being 1 means remove 1 element only
			}
			for (let j = latest_text_cleaned.length; j >= 0; j--) {
				if (
					latest_text_cleaned[j] === undefined ||
					latest_text_cleaned[j] == ""
				) {
					latest_text_cleaned.splice(j, 1);
				} // second parameter being 1 means remove 1 element only
			}

			// console.log(original_text_cleaned)
			// console.log(latest_text_cleaned)

			this.instructions = this.patienceDiffPlus(
				original_text_cleaned,
				latest_text_cleaned
			);

			for (let i = this.instructions.lines.length - 1; i >= 0; i--) {
				if (
					this.instructions.lines[i].aIndex == this.instructions.lines[i].bIndex
				) {
					this.instructions.lines.splice(i, 1);
				}
			}

			// this.instructions.lines.forEach(element => console.log(JSON.stringify(element)))

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
						title: this.title.normalize("NFC"),
						language_name: this.language_name.normalize("NFC"),
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
					if (response == "interpretation deleted") {
						this.permanentlydelete();
					}
				})
				.catch((error) => console.error("Error:", error));
			this.original_text = this.latest_text;
			this.latest_text_unstripped = this.latest_text;
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
				this.latest_text_unstripped = data.interpretation.latest_text;
				this.original_text = data.interpretation.latest_text;
				this.spaced_by = data.interpretation.spaced_by;
			})
			.catch((error) => console.error("Error:", error));
	},
};
</script>


<style scoped>
.editor {
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;
}

.editor::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}
</style>