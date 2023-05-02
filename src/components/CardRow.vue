<template>
	<div>
		<span v-if="$store.state.showStorybookModal == audio_ID"
			class="fixed inset-0 z-10 flex items-center justify-center w-full h-screen">
			<StorybookModal :audio_id="audio_ID" :status="status" :shared_editors="shared_editors"
				:shared_viewers="shared_viewers" />
		</span>
		<span v-if="$store.state.showAddViewersModal == audio_ID"
			class="fixed inset-0 z-10 flex items-center justify-center w-full h-screen">
			<AddViewersModal :audio_id="audio_ID" :status="status" :shared_viewers="shared_viewers" />
		</span>
		<div class="relative transition-colors bg-white border cardrow rounded-xl"
			:class="{ editing: dropdown, notediting: !dropdown }">
			<slot></slot>
			<!-- <img class="w-full h-1/2" :src="image" alt="Sunset in the mountains" /> -->
			<div class="grid items-center" style="grid-template-columns: repeat(9, minmax(150px,1fr));">
				<div v-if="picked == audio_ID"><button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="selectrow()">
						Hide Interpretations
					</button></div>
				<div v-else-if="!archived"> <button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="selectrow()">
						See Interpretations
					</button></div>
				<div v-else></div>

				<div v-if="!archived && (status == 'owner' || status == 'editor')
					">
					<textarea class="w-full font-bold border-gray-300 rounded edittext" rows="1" style="overflow: scroll"
						v-model="localTitle" @focusout="savechanges()"></textarea>
				</div>
				<div v-else>
					<p class="font-bold">{{ title }}</p>
				</div>
				<div v-if="!archived && (status == 'owner' || status == 'editor')
					">
					<textarea class="w-full border-gray-300 rounded edittext" rows="1" style="overflow: scroll"
						v-model="localDescription" @focusout="savechanges()"></textarea>
				</div>
				<div v-else>
					<p>{{ description }}</p>
				</div>
				<p>{{ uploader }}</p>
				<p>{{ last_edited }}</p>
				<span v-if="(!archived && (status == 'owner' || status == 'editor' )) && (tier == 'research' || tier == 'project')">
					<input type="checkbox" id="publictf" value="publictf" v-model="localPublictf" @change="savechanges()" />

					<span v-if="publictf"> yes</span>
					<span v-else> no</span>
				</span>

				<span v-else>
					<span v-if="publictf"> yes</span>
					<span v-else> no</span></span>
				<div>
					<div v-if="!archived && status == 'owner'">

						owner access
					</div>
					<div v-else-if="archived && status == 'owner'">

					</div>
					<div v-else>{{ status }} access</div>
				</div>
				<div class="flex flex-row">

					<div v-if="!archived">
						<button
							class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
							@click="openstorybook()">
							View
						</button>
					</div>
					<div v-else></div>&nbsp;
					<div v-if="!archived && status == 'owner'">

						<button
							class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
							@click="archive()">
							Archive
						</button>
					</div>
					<div v-else-if="archived && status == 'owner'">
						<button
							class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
							@click="unarchive()">
							Restore
						</button>
					</div>
					<div v-else></div>
				</div>

				<p v-if="status == 'owner'"><button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="showStorybookModal(audio_ID)">Manage Collaboration</button></p>
				<p v-else-if="status == 'editor'"><button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="showAddViewersModal(audio_ID)">Manage Viewing</button></p>
				<p v-else-if="status == 'viewer'"><button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="remove_viewer(this.$store.state.user.uid)">Decline Share</button></p>
			</div>
		</div>
		<div v-if="dropdown == true">
			<div v-for="interpretation in interpretationsList" :key="interpretation.id">
				<IntManager @refreshInts="getInterpretations()" :interpretation="interpretation" :audio_ID="audio_ID"
					:shared_editors="interpretation.shared_editors" :shared_viewers="interpretation.shared_viewers"
					@permanentlydestroy="permanentlydelete($event)" @refreshInts2="getInterpretations2()" />
			</div>
		</div>
	</div>
</template>

<script>
import IntManager from "@/components/IntManager.vue";
import StorybookModal from "@/components/StorybookModal.vue";
import AddViewersModal from "@/components/AddViewersModal.vue";
import { getIdToken } from "firebase/auth";

export default {
	name: "CardRow",
	components: { IntManager, StorybookModal, AddViewersModal },
	watch: {
		dropdown: function () {
			this.$store.commit("forceDashboardRerender");
		},
	},
	computed: {
		// the beginning of the highlighted region as manually typed in by the user, in seconds
		dropdown() {
			return this.audio_ID == this.picked;
		},
	},
	data: () => {
		return {
			tier: process.env.VUE_APP_TIER,
			localTitle: "",
			localDescription: "",
			localPublictf: "",
			interpretationsList: [],
			// random: "12345"
		};
	},
	props: {
		title: {
			default: "",
		},

		picked: {
			default: "",
		},

		description: {
			default: "",
		},

		shared_editors: {
			default: [],
		},

		shared_viewers: { default: [] },

		last_edited: { default: "" },

		publictf: {
			default: "",
		},

		uploader: {
			default: "",
		},

		archived: {
			default: false,
		},

		date: {
			default: "",
		},

		status: { default: "" },

		audio_ID: {
			default: "",
		},
	},

	mounted() {
		this.localTitle = this.title
		this.localDescription = this.description
		this.localPublictf = this.publictf
		this.getInterpretations();
	},

	methods: {
		async remove_viewer(viewer) {
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
				"audio/" +
				this.audio_ID +
				"/" +
				this.status +
				"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						// title: this.title,
						// description: this.description,
						// public: this.publictf,
						remove_viewer: viewer,
					}),
				}
			)
				.then((response) => {
					return response.json();
				})

				.then((answer) => {
					if (answer.aid == this.audio_ID) {
						this.$store.commit("removeFromAudioArray", answer.aid);
					} else {
						alert("error; please restart app");
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},



		permanentlydelete(deletedInterpretation) {
			let deleteIndex = this.interpretationsList
				.map((interpretation) => interpretation.id)
				.indexOf(deletedInterpretation);
			this.interpretationsList.splice(deleteIndex, 1);
		},

		selectrow() {
			this.$emit("SelectRow", this.audio_ID);
		},
		showStorybookModal() {
			this.$store.commit("showStorybookModal", this.audio_ID);
		},
		showAddViewersModal() {
			this.$store.commit("showAddViewersModal", this.audio_ID);
		},
		async getInterpretations2() {
			await this.getInterpretations()
			this.$store.commit("forceDashboardRerender");
		},

		async getInterpretations() {
			if (this.dropdown) {
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
					"interpretations/audio/" +
					this.audio_ID +
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
						// console.log("data")
						// console.log(data["interpretations"])
						if (data["interpretations"] != "none") { this.interpretationsList = data["interpretations"]; }
						else { console.log("no interpretations to see")
					return }


						// console.log(this.interpretationsList)
					})
					.catch((error) => console.error("Error:", error));
			}
		},

		openstorybook() {
			this.$router.push({
				name: "Storybook",
				params: { audio_ID: this.audio_ID },
			});
		},

		async unarchive() {
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
				"audio/" +
				this.audio_ID +
				"/" +
				this.status +
				"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						// title: this.title,
						// description: this.description,
						// public: this.publictf,
						archived: false,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})
				.then((answer) => {
					if (answer.id == this.audio_ID) {
						this.$store.commit("mutateAudioArray", answer);
					} else {
						alert("error; please restart app");
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

		async archive() {
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
				"audio/" +
				this.audio_ID +
				"/" +
				this.status +
				"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						// title: this.title,
						// description: this.description,
						public: false,
						archived: true,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})
				.then((answer) => {
					if (answer.id == this.audio_ID) {
						this.$store.commit("mutateAudioArray", answer);
					} else {
						alert("error; please restart app");
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

		async savechanges() {
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
				"audio/" +
				this.audio_ID +
				"/" +
				this.status +
				"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						title: this.localTitle.normalize("NFC"),
						description: this.localDescription.normalize("NFC"),
						public: this.localPublictf,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})
				.then((answer) => {
					if (answer.id == this.audio_ID) {
						this.$store.commit("mutateAudioArray", answer);
					} else {
						alert("error; please restart app");
					}
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},
	},
};
</script>

<style scoped>
.cardrow {
	width: 100%;
}

/* .editing {

} */
.notediting {
	background: white;
}

/* .play {
  top: calc(50% - 1.75rem);
  right: 0;
} */

.edittext {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-y: scroll;
}

.edittext::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
}
</style>