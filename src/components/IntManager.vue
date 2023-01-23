<template>
	<div>

		<span
			v-if="$store.state.showIntCollabModal == interpretation.id"
			class="fixed inset-0 z-10 flex items-center justify-center w-full h-screen"
		>
			<IntCollabModal
				@refreshInterpretations="$emit('refreshInts')"
				:interpretation_id="interpretation.id"
				:audio_id="audio_ID"
				:status="status"
				:shared_editors="shared_editors"
				:shared_viewers="shared_viewers"
			/>
		</span>
		<span
			v-if="$store.state.showIntViewersModal == interpretation.id"
			class="fixed inset-0 z-10 flex items-center justify-center w-full h-screen"
		>
			<IntViewersModal
				@refreshInterpretations="$emit('refreshInts')"
				:interpretation_id="interpretation.id"
				:audio_id="audio_ID"
				:status="status"
				:shared_viewers="shared_viewers"
			/>
		</span>

		<div class="relative transition-colors bg-white border intmanagerrow rounded-xl">
			<!-- <img class="w-full h-1/2" :src="image" alt="Sunset in the mountains" /> -->
			<div
				class="grid items-center"
				style="grid-template-columns: repeat(9, minmax(150px,1fr));"
			>
				<p></p>
				<p class="font-bold">{{ interpretation.title }}</p>
				<p v-if="interpretation.spaced_by">{{ interpretation.language_name }} spaced by "{{interpretation.spaced_by}}"</p>
				<p v-else>{{ interpretation.language_name }}</p>
				<p>{{ interpretation.created_by.display_name }}</p>
				<p>{{ interpretation.last_edited_at.substring(0, 10) + ' UTC' }}</p>
				<span v-if="(shared_editors && shared_editors.map((item) => item.user_ID).includes($store.state.user.uid)) || (interpretation.created_by.user_ID == $store.state.user.uid)">
					<input
						type="checkbox"
						id="publictf"
						value="publictf"
						v-model="publictf"
						@change="savechanges()"
					/>
					<span v-if="publictf"> yes</span>
					<span v-else> no</span>
				</span>
				<span v-else></span>
				<p>
					{{ status }} access
				</p>
				<p><button
						v-if="this.status=='owner' || this.status=='editor'"
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="deletefunc(interpretation.id)"
					>Delete</button></p>
				<p v-if="status == 'owner'"><button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="showIntCollabModal(interpretation.id)"
					>Manage Collaborators</button></p>
				<p v-else-if="status == 'editor'"><button
						class="p-1 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="showIntViewersModal(interpretation.id)"
					>Add Viewers</button></p>
			</div>
		</div>
	</div>
</template>

<script>
import IntCollabModal from "@/components/IntCollabModal.vue";
import IntViewersModal from "@/components/IntViewersModal.vue";
import { getIdToken } from "firebase/auth";

export default {
	name: "IntManager",
	components: {
		IntCollabModal,
		IntViewersModal,
	},
	data: () => {
		return { publictf: false, status: "" };
	},
	props: {
		interpretation: {
			default: {},
		},
		audio_ID: { default: "" },

		shared_editors: {
			default: [],
		},

		shared_viewers: { default: [] },
	},

	mounted() {
		this.publictf = this.interpretation.public;

		if (this.interpretation.created_by.user_ID == this.$store.state.user.uid) {
			this.status = "owner";
			// console.log("owner")
		} else if (
			this.shared_editors &&
			this.shared_editors
				.map((item) => item.user_ID)
				.includes(this.$store.state.user.uid)
		) {
			this.status = "editor";
			// console.log("editor")
		} else if (
			this.shared_viewers &&
			this.shared_viewers
				.map((item) => item.user_ID)
				.includes(this.$store.state.user.uid)
		) {
			this.status = "viewer";
			// console.log("viewer")
		} else if (this.publictf == true) {
			this.status = "public";
			// console.log("public")
		}
	},

	methods: {
		async deletefunc(id) {
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
					id +
					"/audio/" +
					this.audio_ID +
					"/" +
					this.status +
					"/",
				{
					method: "PATCH",
					body: JSON.stringify({
						latest_text: "",
						title: "",
						language_name: "",
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
						this.$emit("permanentlydestroy", id);
					}
				})
				.catch((error) => console.error("Error:", error));
		},

		showIntCollabModal(int_id) {
			this.$store.commit("showIntCollabModal", int_id);
		},
		showIntViewersModal(int_id) {
			this.$store.commit("showIntViewersModal", int_id);
		},
		// openstorybook() {
		//   this.$router.push({
		//     name: "Storybook",
		//     params: { audio_ID: this.audio_ID },
		//   });
		// },
		// unarchive() {
		//   fetch(
		//     process.env.VUE_APP_api_URL +
		//       "audio/" +
		//       this.audio_ID +
		//       "/" +
		//       this.status +
		//       "/",
		//     {
		//       method: "PATCH",
		//       headers: {
		//         "Content-Type": "application/json",
		//         Authorization: this.$store.state.idToken,
		//       },
		//       body: JSON.stringify({
		//         // url: "coverimage.jpg",
		//         // title: this.title,
		//         // description: this.description,
		//         // public: this.publictf,
		//         archived: false,
		//         // shared_with: [],
		//       }),
		//     }
		//   )
		//     .then((response) => {
		//       return response.json();
		//     })
		//     .then((response) => {
		//       this.$store.commit("forceDashboardRerender");
		//     })
		//     .catch((error) => {
		//       console.error("Error:", error);
		//     });
		// },
		// archive() {
		//   fetch(
		//     process.env.VUE_APP_api_URL +
		//       "audio/" +
		//       this.audio_ID +
		//       "/" +
		//       this.status +
		//       "/",
		//     {
		//       method: "PATCH",
		//       headers: {
		//         "Content-Type": "application/json",
		//         Authorization: this.$store.state.idToken,
		//       },
		//       body: JSON.stringify({
		//         // url: "coverimage.jpg",
		//         // title: this.title,
		//         // description: this.description,
		//         public: false,
		//         archived: true,
		//         // shared_with: [],
		//       }),
		//     }
		//   )
		//     .then((response) => {
		//       return response.json();
		//     })
		//     .then((response) => {
		//       this.$store.commit("forceDashboardRerender");
		//     })
		//     .catch((error) => {
		//       console.error("Error:", error);
		//     });
		// },
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
					"interpretations/" +
					this.interpretation.id +
					"/audio/" +
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
						public: this.publictf,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})
				// .then((response) => {
				//   this.$store.commit("forceDashboardRerender");
				// })
				.catch((error) => {
					console.error("Error:", error);
				});
		},
	},
};
</script>

<style scoped>
.intmanagerrow {
	width: 100%;
	/* background: rgba(0, 0, 0, 0.5); */
}

/* .play {
  top: calc(50% - 1.75rem);
  right: 0;
} */
</style>