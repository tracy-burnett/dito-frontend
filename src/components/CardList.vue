<template>
	<div
		class="w-full privatecardlist pb-[8vh]"
		style="overflow: scroll; height:44vh;"
	>

		<!-- <h1 class="mt-8 mb-6 text-2xl font-bold">Active Storybooks</h1> -->

		<div class="fixed z-40 flex flex-row justify-around w-full -mt-[5vh]">
			
			<div class="flex flex-row justify-between basis-2/5"><p>Filters:</p>
				<div>
					<input
						type="checkbox"
						id="owner"
						value="owner"
						v-model="checkedFilters"
						@change="getStorybooks()"
					/>
					<label for="owner"> owner</label></div>

				<div>
					<input
						type="checkbox"
						id="editor"
						value="editor"
						v-model="checkedFilters"
						@change="getStorybooks()"
					/>
					<label for="editor"> editor</label></div>

				<div>
					<input
						type="checkbox"
						id="viewer"
						value="viewer"
						v-model="checkedFilters"
						@change="getStorybooks()"
					/>
					<label for="viewer"> viewer</label></div>

				<div>
					<input
						type="checkbox"
						id="public"
						value="public"
						v-model="checkedFilters"
						@change="getStorybooks()"
					/>
					<label for="public"> other</label></div>
				<!-- {{audioArray}} -->

				<div>
					<input
						type="checkbox"
						id="archived"
						value="archived"
						v-model="checkedFilters"
						@change="getStorybooks()"
					/>
					<label for="archived"> archived</label></div>
			</div><div>
				<input
					class="px-3 py-.5 border border-gray-300 rounded w-[20vw]"
					placeholder="Search Storybooks"
					v-model="searchterm"	
					@keyup.enter="search"
				/>
			</div>
			<!-- {{audioArray}} -->
			
		</div>

		<div>
			<div class="grid grid-cols-9">
				<p></p>
				<p class="font-bold">Title</p>
				<p class="">Description</p>
				<p class="">created by</p>
				<!-- <p>created at</p> -->
				<p>last edited at</p>
				<p>Public?</p>
				<p>Access</p>
				<p></p>
			</div>
			<!-- for each audio file in the list of audio files owned by, or shared with, the logged-in user, display a "Card" with information about that audio storybook -->
			<span v-if="checkedFilters.includes('owner')">
				<span
					v-for="audio in audioArrayOwner"
					:key="audio.id"
				>
					<CardRow
						:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
						:description="audio.description"
						:uploader="audio.uploaded_by.display_name"
						:publictf="audio.public"
						:shared_editors="audio.shared_editors"
						:shared_viewers="audio.shared_viewers"
						:picked="selected"
						:archived="audio.archived"
						status="owner"
						:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
						:title="audio.title"
						:audio_ID="audio.id"
						@SelectRow="uncheck(audio.id)"
					>

						<!-- <input
							type="radio"
							:id="audio.id"
							:value="audio.id"
							v-model="selected"
							@click="uncheck(audio.id)"
						/>
						<label :for="audio.id"> edit</label> -->
					</CardRow>
				</span>
			</span>
			<span v-if="checkedFilters.includes('editor')">
				<div
					v-for="audio in audioArrayEditor"
					:key="audio.id"
				>
					<CardRow
						:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
						:description="audio.description"
						:uploader="audio.uploaded_by.display_name"
						status="editor"
						:picked="selected"
						:shared_viewers="audio.shared_viewers"
						:publictf="audio.public"
						:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
						:title="audio.title"
						:audio_ID="audio.id"
					>
						<!-- <input
							type="radio"
							:id="audio.id"
							:value="audio.id"
							v-model="selected"
							@click="uncheck(audio.id)"
						/>
						<label :for="audio.id"> more options</label> -->
					</CardRow>
				</div>
			</span>
			<span v-if="checkedFilters.includes('viewer')">
				<div
					v-for="audio in audioArrayViewer"
					:key="audio.id"
				>
					<CardRow
						:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
						:uploader="audio.uploaded_by.display_name"
						:description="audio.description"
						:publictf="audio.public"
						:picked="selected"
						status="viewer"
						:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
						:title="audio.title"
						:audio_ID="audio.id"
					>
						<!-- <input
							type="radio"
							:id="audio.id"
							:value="audio.id"
							v-model="selected"
							@click="uncheck(audio.id)"
						/>
						<label :for="audio.id"> more options</label> -->
					</CardRow>
				</div>
			</span>
			<span v-if="checkedFilters.includes('public')">
				<div
					v-for="audio in audioArrayPublic"
					:key="audio.id"
				>
					<CardRow
						:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
						:description="audio.description"
						:uploader="audio.uploaded_by.display_name"
						:picked="selected"
						status="public"
						:publictf="audio.public"
						:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
						:title="audio.title"
						:audio_ID="audio.id"
					>
						<div>
							<!-- <input
								type="radio"
								:id="audio.id"
								:value="audio.id"
								v-model="selected"
								@click="uncheck(audio.id)"
							/>
							<label :for="audio.id"> more options</label> -->
						</div>
					</CardRow>
				</div>
			</span><br /><br />

			<span v-if="(audioArrayArchive.length > 0) && (checkedFilters.includes('archived'))">
				<h1 class="mt-8 mb-6 text-2xl font-bold">Archived Storybooks (deleted, but can be restored)</h1>
				<br />
				<div class="grid grid-cols-9">
					<div></div>
					
					<p class="font-bold">Title</p>
					<p class="">Description</p>
					<p class="">created by</p>
					<!-- <p>created at</p> -->
					<p>last edited at</p>
					<p></p>
					<p></p>
				</div>
			</span>
			<span v-if="checkedFilters.includes('archived')">
				<div
					v-for="audio in audioArrayArchive"
					:key="audio.id"
				>
					<CardRow
						:date="audio.uploaded_at.substring(0, 10) + ' UTC'"
						:description="audio.description"
						:uploader="audio.uploaded_by.display_name"
						:publictf="audio.public"
						status="owner"
						:archived="audio.archived"
						:last_edited="audio.last_updated_at.substring(0, 10) + ' UTC'"
						:title="audio.title"
						:audio_ID="audio.id"
					/>
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
			audioArray: [],
			audioArrayOwner: [], // the list of audio files owned by the logged-in user
			audioArrayEditor: [],
			audioArrayViewer: [],
			audioArrayPublic: [],
			audioArrayArchive: [],
			lastknownscrollposition: 0,
		};
	},
	computed: {
		selected: {
			// getter
			get() {
				return this.$store.state.selected; // in the store
			},
			set(selected) {
				this.$store.commit("updateSelected", selected);
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
		"$store.state.idToken": function () {
			this.getStorybooks();
		},
	},
	components: {
		CardRow,
	},
	mounted() {
		if (this.$store.state.idToken) {
			this.getStorybooks();
		}
	},
	methods: {
		uncheck(id) {
			// console.log(id)
			// console.log("was " + this.previouslySelected)
			// console.log("now is " + this.selected)
			if (id == this.selected) {
				this.selected = false;
			} else if (id != this.selected) {
				this.selected = id;
			}
		},

		getStorybooks() {
			this.audioArray = [];
			(this.audioArrayOwner = []), // the list of audio files owned by the logged-in user
				(this.audioArrayEditor = []),
				(this.audioArrayViewer = []),
				(this.audioArrayPublic = []),
				(this.audioArrayArchive = []),
				fetch(process.env.VUE_APP_api_URL + "audio/user/", {
					method: "GET",

					headers: {
						"Content-Type": "application/json",
						Authorization: this.$store.state.idToken,
					},
				})
					.then((response) => response.json()) // json to object
					.then(
						(data) => {
							this.audioArray = data["audio files"];
							// console.log(this.audioArray)
						} // collect the list of audio files that are owned by, or shared with, the logged-in user
					)
					.then((data) => {
						this.audioArray.forEach((element) => {
							// console.log(element.uploaded_by.shared_editors)
							if (
								element.uploaded_by.user_ID == this.$store.state.user.uid &&
								!element.archived
							) {
								// console.log("1")
								this.audioArrayOwner.push(element);
							} else if (
								element.shared_editors.some(
									(e) => e.user_ID === this.$store.state.user.uid
								)
							) {
								// console.log("2")
								this.audioArrayEditor.push(element);
							} else if (
								element.shared_viewers.some(
									(e) => e.user_ID === this.$store.state.user.uid
								)
							) {
								// console.log("3")
								this.audioArrayViewer.push(element);
							} else if (element.public) {
								// console.log("4")
								this.audioArrayPublic.push(element);
							} else if (
								element.archived &&
								element.uploaded_by.user_ID == this.$store.state.user.uid
							) {
								this.audioArrayArchive.push(element);
							}
						});
						this.$nextTick(function () {
							// console.log(this.$store.state.cardlistscrollposition)
							window.scrollTo(
								0,
								this.$store.state.cardlistscrollposition * 14.3
							);
							window.addEventListener("scroll", this.myEventHandler);
						});
					})
					.catch((error) => console.error("Error:", error));
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
::placeholder {
	/* vertical-align: center; */
}
</style>