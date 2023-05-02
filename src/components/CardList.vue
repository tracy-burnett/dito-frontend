<template>
	<div class="w-full privatecardlist pb-[8vh]" style="overflow: scroll; height:44vh;">

		<div class="fixed z-[8] flex flex-row justify-around w-full -mt-[5vh]">

			<div class="flex flex-row flex-wrap justify-between basis-full lg:basis-2/5">
				<p>Filters:</p>
				<div>
					<input type="checkbox" id="owner" value="owner" v-model="checkedFilters" />
					<label for="owner"> owner</label>
				</div>

				<div>
					<input type="checkbox" id="editor" value="editor" v-model="checkedFilters" />
					<label for="editor"> editor</label>
				</div>

				<div>
					<input type="checkbox" id="viewer" value="viewer" v-model="checkedFilters" />
					<label for="viewer"> viewer</label>
				</div>

				<div>
					<input type="checkbox" id="public" value="public" v-model="checkedFilters" />
					<label for="public"> public</label>
				</div>

				<div>
					<input type="checkbox" id="archived" value="archived" v-model="checkedFilters" />
					<label for="archived"> archived</label>
				</div>
			</div>
			<div>
				<input class="px-3 py-.5 border border-gray-300 rounded w-[20vw]"
					placeholder="Search Storybooks (case-sensitive)" v-model="searchterm" @keyup.enter="search" />
			</div>

		</div>

		<div class="grid pt-[3vh] sticky  w-full z-[9]" style="grid-template-columns: repeat(9, minmax(150px,1fr));">
			<p></p>
			<p class="font-bold cursor-pointer" @click="$store.commit('sortBy', '1')">Title</p>
			<p class="cursor-pointer" @click="$store.commit('sortBy', '2')">Description</p>
			<p class="cursor-pointer" @click="$store.commit('sortBy', '3')">created by</p>
			<p class="cursor-pointer" @click="$store.commit('sortBy', '4')">last edited at</p>
			<p v-if="tier == 'research' || tier == 'project'" class="cursor-pointer" @click="$store.commit('sortBy', '5')">
				Public?</p>
			<p v-else></p>
			<p>Access</p>
			<p></p>
			<p></p>
		</div>

		<div v-if="processingStorybooks == true"
			class="flex flex-row flex-wrap justify-around basis-full pt-[10vh] lg:basis-2/5">processing information from
			server; please wait...</div>

		<div style="overscroll-behavior:none;">
			<!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->
			<span v-for="audio in audioArrayCurrent" :key="audio.id">
				<CardRow
					v-if="audio.uploaded_by.user_ID == $store.state.user.uid && !audio.archived && checkedFilters.includes('owner')"
					:date="audio.uploaded_at.substring(0, 10) + ' UTC'" :description="audio.description"
					:uploader="audio.uploaded_by.display_name" :publictf="audio.public"
					:shared_editors="audio.shared_editors" :shared_viewers="audio.shared_viewers" :picked="selected"
					:archived="audio.archived" status="owner" :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
					:title="audio.title" :audio_ID="audio.id" @SelectRow="uncheck(audio.id)"></CardRow>
				<CardRow
					v-else-if="audio.shared_editors.some((e) => e.user_ID === $store.state.user.uid) && checkedFilters.includes('editor')"
					:date="audio.uploaded_at.substring(0, 10) + ' UTC'" :description="audio.description"
					:uploader="audio.uploaded_by.display_name" status="editor" :picked="selected"
					:shared_viewers="audio.shared_viewers" :publictf="audio.public"
					:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'" :title="audio.title" :audio_ID="audio.id"
					@SelectRow="uncheck(audio.id)"></CardRow>
				<CardRow
					v-else-if="audio.shared_viewers.some((e) => e.user_ID === $store.state.user.uid) && checkedFilters.includes('viewer')"
					:date="audio.uploaded_at.substring(0, 10) + ' UTC'" :uploader="audio.uploaded_by.display_name"
					:description="audio.description" :publictf="audio.public" :picked="selected" status="viewer"
					:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'" :title="audio.title" :audio_ID="audio.id"
					@SelectRow="uncheck(audio.id)"></CardRow>
				<CardRow v-else-if="audio.public && checkedFilters.includes('public')"
					:date="audio.uploaded_at.substring(0, 10) + ' UTC'" :description="audio.description"
					:uploader="audio.uploaded_by.display_name" :picked="selected" status="public" :publictf="audio.public"
					:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'" :title="audio.title" :audio_ID="audio.id"
					@SelectRow="uncheck(audio.id)">
				</CardRow>
			</span>

			<span v-if="checkedFilters.includes('archived') && displayArchived">
				<h1 class="mt-8 mb-6 text-2xl font-bold">Archived Storybooks (deleted, but can be restored)</h1>
				<br />
				<div class="grid" style="grid-template-columns: repeat(9, minmax(150px,1fr));">
					<div></div>

					<p class="font-bold">Title</p>
					<p class="">Description</p>
					<p class="">created by</p>
					<p>last edited at</p>
					<p></p>
					<p></p>
				</div>
				<div v-for="audio in audioArrayCurrent" :key="audio.id">
					<CardRow v-if="audio.archived && audio.uploaded_by.user_ID == $store.state.user.uid"
						:date="audio.uploaded_at.substring(0, 10) + ' UTC'" :description="audio.description"
						:uploader="audio.uploaded_by.display_name" :publictf="audio.public" status="owner"
						:archived="audio.archived" :last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
						:title="audio.title" :audio_ID="audio.id" />
				</div>
			</span>
		</div>
	</div>
</template>

<script>
import CardRow from "@/components/CardRow.vue";

export default {
	data() {
		return {
			tier: process.env.VUE_APP_TIER,
			audioArray: [],
			audioArrayCurrent: [],
			lastknownscrollposition: 0,
			searchResultAudioArray: [],
			// searchterm: "",
			processingStorybooks: false,
		};
	},
	computed: {
		displayArchived() {
			return this.audioArrayCurrent.reduce(
				(a, c) =>
					c.archived === true &&
						c.uploaded_by.user_ID == this.$store.state.user.uid
						? ++a
						: a,
				0
			);
		},

		regexwithsearchterm() {
			if (this.searchterm != "") {
				return new RegExp(`${this.escapeRegex(this.searchterm)}+`, "g");
			} else {
				return "";
			}
		},

		selected: {
			// getter
			get() {
				return this.$store.state.selected; // in the store
			},
			set(selected) {
				this.$store.commit("updateSelected", selected);
			},
		},


		searchterm: {
			// getter
			get() {
				return this.$store.state.searchterm; // in the store
			},
			set(searchterm) {
				this.$store.commit("updateSearchTerm", searchterm);
			},
		},
		checkedFilters: {
			// getter
			get() {
				return this.$store.state.checkedFilters; // in the store
			},
			set(checkedFilters) {
				this.$store.commit("updateCheckedFilters", checkedFilters);
			},
		},
	},
	name: "CardList",
	watch: {
		"$store.state.audioArrayChanged": function () {
			this.getStorybooks();
		},
	},
	components: {
		CardRow,
	},
	mounted() {
		this.getStorybooks();
		window.addEventListener("scroll", this.myEventHandler);
	},
	methods: {
		escapeRegex: function (string) {
			return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		},

		search() {
			this.searchResultAudioArray = [...this.$store.state.audioArray];
			let i = 0;
			while (i < this.searchResultAudioArray.length) {
				let audio = this.searchResultAudioArray[i];
				let k = 0;
				if (audio.description.match(this.regexwithsearchterm)) {
					k++;
				}
				if (
					audio.last_updated_at.substring(0, 10).match(this.regexwithsearchterm)
				) {
					k++;
				}
				if (audio.title.match(this.regexwithsearchterm)) {
					k++;
				}
				if (
					audio.uploaded_at.substring(0, 10).match(this.regexwithsearchterm)
				) {
					k++;
				}

				if (audio.uploaded_by.anonymous == false) {
					if (audio.uploaded_by.display_name.match(this.regexwithsearchterm)) {
						k++;
					}
				}

				if (k == 0) {
					this.searchResultAudioArray.splice(i, 1);
				} else {
					i += 1;
				}
			}
			// console.log(this.searchResultAudioArray);
			if (this.searchResultAudioArray.length > 0) {
				this.audioArrayCurrent = [...this.searchResultAudioArray];
			} else {
				this.audioArrayCurrent = [...this.$store.state.audioArray];
			}
		},

		uncheck(id) {
			// console.log(id)
			// console.log("was " + this.previouslySelected)
			if (id == this.selected) {
				this.selected = false;
			} else if (id != this.selected) {
				this.selected = id;
			}
		},

		async getStorybooks() {
			this.processingStorybooks = true;
			this.audioArrayCurrent = [];
			// console.log(this.$store.state.audioArray)
			if (
				this.$store.state.audioArray &&
				this.$store.state.audioArray.length > 0
			) {
				this.processingStorybooks = false;
				this.audioArrayCurrent = [...this.$store.state.audioArray];
			}
			else if (this.$store.state.audioArray &&
				this.$store.state.audioArray.length == 0) { this.processingStorybooks = false; }
			if (this.searchterm != "") { this.search() }
			this.$nextTick(function () {
				// console.log(this.$store.state.cardlistscrollposition)
				window.scrollTo(0, this.$store.state.cardlistscrollposition * 14.3);
			});
			// console.log(this.audioArrayCurrent)
		},

		myEventHandler() {
			this.lastknownscrollposition = window.scrollY;

			this.$store.commit("updatescrollposition", this.lastknownscrollposition);
		},
	},

	unmounted() {
		window.removeEventListener("scroll", this.myEventHandler);
	},
};
</script>

<style scoped>
/* ::placeholder { */
/* vertical-align: center; */
/* } */

.privatecardlist {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-y: scroll;
}

.privatecardlist::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
}
</style>