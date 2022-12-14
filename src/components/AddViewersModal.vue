<template>
	<div
		class="flex flex-col items-center justify-center flex-auto h-full mt-10 overflow-hidden backdrop"

	>
		<div class="flex flex-col items-center p-8 bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Viewers</h1>
			<br />
			<div v-if="shared_viewers.length > 0">
				<h3>Viewers</h3>
				<div
					v-for="viewer in shared_viewers"
					:key="viewer.user_ID"
				>{{ viewer.display_name }}<button @click="remove_viewer(viewer.email)">Remove</button></div>
			</div>

			Enter the email address of the Dito account to invite to view
			this storybook.
			<br />
			<input
				class="w-full px-3 py-1 border border-gray-300 rounded"
				placeholder="email address"
				v-model="email_mixedcase"
			/>

			<button
				class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors border rounded bg-cyan-700 border-cyan-600 hover:bg-cyan-600"
				@click="update"
			>
				Update Viewers
			</button>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "AddViewersModal",
	components: {},
	data() {
		return {
			email_mixedcase: "",
			//   int_language: "",
			//   int_spacing: "",
		};
	},
	computed: {
		email() {
return this.email_mixedcase.toLowerCase()
		},
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
						shared_viewer: this.email,
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
			this.$store.commit("hideAddViewersModal");
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