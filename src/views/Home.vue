<template>
	<div class="flex-auto">
		<div class="flex flex-col">
			<Navbar />
			<Header />
			<div>
				<component v-bind:is="$store.state.infobit"></component>
			</div>
		</div>
	</div>
</template>

<script>
import Navbar from "@/components/Navbar_Sparse.vue";
import Header from "@/components/Header.vue";
import PublicCardList from "@/components/PublicCardList.vue";
import CreateStorybook from "@/views/CreateStorybook_Sparse.vue";
import InfoPublish from "@/components/InfoPublish.vue";
import InfoRevitalize from "@/components/InfoRevitalize.vue";
import Login from "@/views/LoginOrRegister.vue";
import { getIdToken } from "firebase/auth";

export default {
	name: "Home",
	components: {
		Navbar,
		Header,
		PublicCardList,
		CreateStorybook,
		InfoPublish,
		InfoRevitalize,
		Login,
	},
	watch: {
		"$store.state.idToken": function () {
			this.getStorybooks();
		},
	},
	mounted() {
		document.title = "Dito - " + window.location.hostname.split(".")[0];
		// this.getStorybooks()
	},
	methods: {
		async getStorybooks() {
			this.processingStorybooks = true;
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
			this.$store.commit("setAudioArray", []);
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
						this.$store.commit("setAudioArray", data["audio files"]);
					} // collect the list of audio files that are owned by, or shared with, the logged-in user
				)
				.catch((error) => console.error("Error:", error));
		},
	},
};
</script>
