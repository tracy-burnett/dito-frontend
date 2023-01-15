<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full mt-10 overflow-hidden backdrop">
		<div class="flex flex-col items-center p-8 bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Collaborators</h1>
			<br />
			<div v-if="shared_editors.length > 0">
				<h3>Editors</h3>
				<div
					v-for="editor in shared_editors"
					:key="editor.user_ID"
				>{{ editor.display_name }}<button @click="remove_editor(editor.email)">Remove</button></div>
			</div>
			<div v-if="shared_viewers.length > 0">
				<h3>Viewers</h3>
				<div
					v-for="viewer in shared_viewers"
					:key="viewer.user_ID"
				>{{ viewer.display_name }}<button @click="remove_viewer(viewer.email)">Remove</button></div>
			</div>

			Enter the email address of the Dito account to invite to collaborate on
			this storybook.
			<br />
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="email address"
				v-model="email_mixedcase"
			/>

			<input
				type="radio"
				value="editor"
				v-model="coll_type"
			/>
			<label> editor</label>
			<input
				type="radio"
				value="viewer"
				v-model="coll_type"
			/>
			<label> viewer</label>

			<button
				class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors bg-indigo-500 border border-indigo-400 rounded hover:bg-indigo-400"
				@click="update"
			>
				Update Collaborators
			</button>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "StorybookModal",
	components: {},
	computed: {
		// the beginning of the highlighted region as manually typed in by the user, in seconds
		new_viewer() {
			if (this.coll_type == "viewer") {
				return this.email;
			} else {
				return null;
			}
		},
		new_editor() {
			if (this.coll_type == "editor") {
				return this.email;
			} else {
				return null;
			}
		},
		email() {
			return this.email_mixedcase.toLowerCase();
		},
	},
	data() {
		return {
			email_mixedcase: "",
			coll_type: "",
			//   int_language: "",
			//   int_spacing: "",
		};
	},
	props: {
		shared_editors: {
			default: [],
		},

		shared_viewers: { default: [] },

		audio_id: {
			default: "",
		},

		status: {
			default: "",
		},
	},
	methods: {
		async remove_editor(editor) {
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
					this.audio_id +
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
						remove_editor: editor,
					}),
				}
			)
				.then((response) => {
					return response.json();
				})

				.then((response) => {
					this.$store.commit("forceDashboardRerender");
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

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
					this.audio_id +
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

				.then((response) => {
					this.$store.commit("forceDashboardRerender");
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

		async update() {
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
					this.audio_id +
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
						shared_editor: this.new_editor,
						shared_viewer: this.new_viewer,
					}),
				}
			)
				.then((response) => {
					return response.json();
				})

				.then((response) => {
					this.$store.commit("forceDashboardRerender");
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

		closeModal() {
			this.$store.commit("hideStorybookModal");
		},
	},
};
</script>

<style scoped>
.backdrop {
	background: rgba(0, 0, 0, 0.5);
	position: fixed;
	width: 100%;
	height: 100%;
}
.modal {
	-ms-overflow-style: none; /* for Internet Explorer, Edge */
	scrollbar-width: none; /* for Firefox */
	overflow-y: scroll;
}

.modal::-webkit-scrollbar {
	display: none; /* for Chrome, Safari, and Opera */
}
</style>