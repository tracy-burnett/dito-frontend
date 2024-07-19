<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
import { auth } from "./firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

export default {
	async created() {
		await onAuthStateChanged(auth, (user) => {
			if (user) {
				// User is signed in, see docs for a list of available properties
				// https://firebase.google.com/docs/reference/js/firebase.User
				this.$store.state.user = user;
				getIdToken(this.$store.state.user)
					.then((idToken) => {
						this.$store.commit("SetIdToken", idToken);
						// console.log(this.$store.state.idToken)
					})
					.catch((error) => {
						// An error happened.
						console.log("Oops. " + error.code + ": " + error.message);
					});
				console.log("you are currently signed in");
			} else {
				// User is signed out
				this.$store.commit("Logout_User")
				this.$store.commit("ClearIDToken")
				console.log("everybody signed out");
				// this.$router.push("/");
			}

			if (this.$store.state.user) {
				this.$store.commit('toggleInfobit', 'PublicCardList');
			}

			this.$store.commit(
				"confirmAuth"
			);
		});
	},



	watch: {
		"$store.state.user": function () {
			this.getStorybooks();
		},
		// "$store.state.getNewStorybooks": function () {
		// 	this.getStorybooks();
		// },
	},
	mounted() {
		document.title = "Dito - " + window.location.hostname.split(".")[0];
		this.$store.commit("updatePortalName", window.location.hostname.split(".")[0])
		this.getStorybooks()
	},
	methods: {
		async getStorybooks() {
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
						if (data["audio files"] != undefined) { this.$store.commit("setAudioArray", data["audio files"]); }

					} // collect the list of audio files that are owned by, or shared with, the logged-in user
				)
				.catch((error) => console.error("Error:", error));
		},
	},


};
</script>

<style>
#app {
	/* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px; */
	/* overflow:hidden */
	font-family: "Myriad Pro", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif;
	/* overscroll-behavior-x: none; */
}

html {
    height  : 100%;
    overflow: hidden;
    position: relative;
}
body {
    height  : 100%;
    overflow: auto;
    position: relative;
}
</style>
