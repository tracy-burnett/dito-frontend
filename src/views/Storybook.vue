<template>
	<div @click.ctrl.exact="playerPlayPause++" class="w-full">
		<span v-if="showAddInterpretationModal"
			class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen">
			<AddInterpretationModal :audio_id="audio_ID" @addCreatedInterpretation="addCreatedInterpretation($event)"
				@closeInterpretationModal="closeInterpretationModal()" />
		</span>
		<span v-if="showUploadIntModal" class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen">
			<UploadIntModal :audio_id="audio_ID" @addCreatedInterpretation="addCreatedInterpretation($event)"
				@closeUploadIntModal="closeUploadIntModal()" />
		</span>

		<Navbar>
			<!-- <p class="mt-1 text-sm font-semibold text-center cursor-pointer text-slate-100">
				{{ $store.state.portalname }}
			</p> -->
		</Navbar>
		<div class="absolute w-full overflow-x-hidden justify-items-center hero">
			<div class="pt-[5vh] flex flex-row justify-between h-[100vh]">

				<div>
					<PlayerVertical v-if="this.$store.state.authCompleted" :key="playerKey" :audio_ID="audio_ID"
						:playerPlayPause="playerPlayPause" @rerenderPlayer="playerKey++" />
				</div>
				<div class="flex flex-row ml-[105px] mr-[105px] w-full">

					<span v-for="interpretation in $store.state.consoles" :key="interpretation"
						class="w-full box-border px-[.5vw]">
						<!-- tell the column which audio ID we are working with, which interpretations to put in the dropdown menu for viewing, which interpretations are currently being viewed,
      and the id of the interpretation to be displayed in this column in the browser window.  The interpretation component can use events
      to tell the current component to delete this interpretation column and add a new one for a different interpretation ID. -->
						<SingleInterpretation :audio_id="audio_ID" :interpretationsList="interpretationsList"
							:formerInterpretationsList="formerInterpretationsList" :interpretation_id="interpretation"
							@returnFormerInterpretation="returnFormerInterpretation($event)"
							@displayInterpretationID="displayInterpretationID($event)"
							@permanentlydestroy="permanentlydestroy($event)"
							@exchangeInterpretations="exchangeInterpretationsfunction($event)"
							@updateTitleLanguage="updateTitleLanguagefunc($event)" />
					</span>
					<!-- the following component can tell the current component to add a new column for an interpretation that it just created,
      or to add a new column for an interpretation that has previously been created. -->

				</div>
				<div>
					<AddInterpretationViewer :audio_id="audio_ID" :interpretationsList="interpretationsList"
						@toggleInterpretationModal="toggleInterpretationModal()"
						@toggleUploadIntModal="toggleUploadIntModal()"
						@displayInterpretationID="displayInterpretationID($event)" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { useRoute } from 'vue-router';
import Navbar from "@/components/Navbar_Sparse.vue";
import PlayerVertical from "@/components/PlayerVertical.vue";
import SingleInterpretation from "@/components/SingleInterpretation.vue";
import AddInterpretationViewer from "@/components/AddInterpretationViewer.vue";
import AddInterpretationModal from "@/components/AddInterpretationModal.vue";
import UploadIntModal from "@/components/UploadIntModal.vue";
import { getIdToken } from "firebase/auth";

export default {
	name: "Storybook",
	components: {
		Navbar,
		PlayerVertical,
		SingleInterpretation,
		AddInterpretationViewer,
		AddInterpretationModal,
		UploadIntModal,
	},
	data: () => {
		return {
			playerKey: 0, // helper; when it changes, reload Player Vertical
			interpretationsList: [], // the list of interpretations that can be selected from the dropdown menu (does not include interpretations currently being viewed by this user in this browser window)
			formerInterpretationsList: [], // the list of interpretations currently being viewed by this user in this browser window
			showAddInterpretationModal: false,
			showUploadIntModal: false,
			playerPlayPause: 0, // when this changes, play or pause Player Vertical
			route: {},
			intArray: [],
		};
	},
	props: {
		audio_ID: "",
		// title: "",
	},
	computed: {
		// consolespace() {
		// 	return this.$store.state.consoleswidth - 210;
		// },
	},

	watch: {
		"$store.state.authCompleted": function () {
			if (this.$store.state.authCompleted === true) {
				this.getInterpretations();
			}
		},

		"$store.state.consoleschanged": function () {
			if (this.$store.state.promptsObject.code != "en") {
				const url = new URL(location)
				url.searchParams.set("view", this.$store.state.promptsObject.code)
				let openparam = ""
				for (let i = 0; i < this.$store.state.consoles.length; i++) {
					openparam = openparam + this.$store.state.consoles[i]
				}
				if (openparam.length > 0) { url.searchParams.set("open", openparam) }
				else { url.searchParams.delete("open") }
				history.replaceState(history.state, '', url)
			}
			else {
				const url = new URL(location)
				url.searchParams.delete("view")
				let openparam = ""
				for (let i = 0; i < this.$store.state.consoles.length; i++) {
					openparam = openparam + this.$store.state.consoles[i]
				}
				if (openparam.length > 0) { url.searchParams.set("open", openparam) }
				else { url.searchParams.delete("open") }
				history.replaceState(history.state, '', url)
			}


		},

	},

	created() {
		window.addEventListener("resize", this.myEventHandler);
	},

	mounted() {

		this.$store.commit("updateRouteName", "Storybook")




		// console.log(this.$store.state.promptsObject)
		this.route = useRoute();
		// console.log(this.route)
		if (this.route.query.open) {
			this.intArray = this.route.query.open.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&").match(new RegExp(/.{11}/g))
		}


		// if (this.$store.state.promptsObject.code != "en") {
		// 	const url = new URL(location)
		// 	url.searchParams.set("view", this.$store.state.promptsObject.code)
		// 	history.replaceState(history.state, '', url)
		// }
		// else {
		// 	// console.log(this.$store.state.promptsObject.code)
		// 	const url = new URL(location)
		// 	// console.log(url)
		// 	console.log("FOUR")
		// 	url.searchParams.delete("view")
		// 	history.replaceState(history.state, '', url)
		// }

		// console.log(this.intArray);

		document.title =
			"Dito - " + window.location.hostname.split(".")[0];
		if (this.$store.state.authCompleted === true) {
			this.getInterpretations();
		}
		// console.log(this.$route.params)
	},
	unmounted() {
		this.$store.commit("updateAudioDuration", 0);
		window.removeEventListener("resize", this.myEventHandler);
	},

	beforeUnmount() {
		this.$store.commit("clearConsoles");
		this.$store.commit("updateAudioTime", 0)
		this.interpretationsList.length = 0;
		this.formerInterpretationsList.length = 0;
	},

	methods: {

		async getInterpretations() {
			//fetch the interpretations the logged-in user has access to for this audio file

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

					if (data["interpretations"] != "none") {
						this.interpretationsList = data["interpretations"];
						let mapped = this.interpretationsList.map(
							(item) => item.id
						)

						this.intArray.forEach(queryint => {
							if (mapped.indexOf(queryint) != -1) {
								this.displayInterpretationID(queryint);
								// change this to router push???!!!!
							}

						});

						if (this.$store.state.consoles.length == 0) {
							let temp_id = this.interpretationsList[0].id;
							this.displayInterpretationID(temp_id);
						}
					}


				})
				.catch((error) => console.error("Error:", error));

			this.$store.commit(
				"updateConsolesWidth",
				document.documentElement.clientWidth
			);
			this.$store.commit(
				"updateConsolesHeight",
				document.documentElement.clientHeight
			);
		},

		myEventHandler(e) {
			this.$store.commit(
				"updateConsolesWidth",
				document.documentElement.clientWidth
			);
			this.$store.commit(
				"updateConsolesHeight",
				document.documentElement.clientHeight
			);
		},

		permanentlydestroy(oldInterpretation) {
			// make an array of the ID's of interpretations currently being viewed
			// console.log(oldInterpretation);
			let mappedoldIDsArray = this.formerInterpretationsList.map(
				(item) => item.id
			);

			// find the index # of the ID to be returned to the dropdown menu (and removed from the viewer)
			let indexofold = mappedoldIDsArray.indexOf(oldInterpretation);
			if (indexofold > -1) {
				// ... and remove it from the list of interpretations currently being viewed
				this.formerInterpretationsList.splice(indexofold, 1); // 2nd parameter means remove one item only
			}

			// tell the Vuex store to remove the ID number of the interpretation in question from the list of interpretions that currently need columns in the browser window
			this.$store.commit("deleteConsole", oldInterpretation);
		},

		exchangeInterpretationsfunction({ newID, formerinterpretation }) {
			let mappedoldIDsArray = this.formerInterpretationsList.map(
				(item) => item.id
			);

			let indexofold = mappedoldIDsArray.indexOf(formerinterpretation);
			if (indexofold > -1) {
				// if the index # is successfully identified, then add the whole interpretation object to the list of interpretations for the dropdown menu...
				this.interpretationsList.unshift(
					this.formerInterpretationsList[indexofold]
				);
				// ... and remove it from the list of interpretations currently being viewed
				this.formerInterpretationsList.splice(indexofold, 1); // 2nd parameter means remove one item only
			}

			let mappedIDsArray = this.interpretationsList.map((item) => item.id);
			let index = mappedIDsArray.indexOf(newID);
			if (index > -1) {
				// if the index # is successfully identified, then add the whole interpretation object to the list of interpretations for the browser window...

				this.formerInterpretationsList.push(this.interpretationsList[index]);
				// ... and remove it from the list of interpretations currently in the Dropdown menu
				this.interpretationsList.splice(index, 1); // 2nd parameter means remove one item only
			}
			let tempObject = { newID, formerinterpretation }
			this.$store.commit("exchangeConsole", tempObject)
			if (this.$store.state.prompterID == formerinterpretation) {
				this.$store.commit("removePrompterID");
			}

		},

		// move an interpretation from a column in the browser window to the dropdown menu
		returnFormerInterpretation(oldInterpretation) {
			// make an array of the ID's of interpretations currently being viewed
			// console.log(oldInterpretation);
			let mappedoldIDsArray = this.formerInterpretationsList.map(
				(item) => item.id
			);

			// find the index # of the ID to be returned to the dropdown menu (and removed from the viewer)
			let indexofold = mappedoldIDsArray.indexOf(oldInterpretation);
			if (indexofold > -1) {
				// if the index # is successfully identified, then add the whole interpretation object to the list of interpretations for the dropdown menu...
				this.interpretationsList.unshift(
					this.formerInterpretationsList[indexofold]
				);
				// ... and remove it from the list of interpretations currently being viewed
				this.formerInterpretationsList.splice(indexofold, 1); // 2nd parameter means remove one item only
			}

			// tell the Vuex store to remove the ID number of the interpretation in question from the list of interpretions that currently need columns in the browser window
			this.$store.commit("deleteConsole", oldInterpretation);
			if (this.$store.state.prompterID == oldInterpretation) {
				this.$store.commit("removePrompterID");
			}
		},

		displayInterpretationID(newID) {
			// make an array of the ID's of interpretations currently in the Dropdown menu
			let mappedIDsArray = this.interpretationsList.map((item) => item.id);

			// find the index # of the interpretation ID that we want to add into a column in the browser window (and removed from the Dropdown menu)
			let index = mappedIDsArray.indexOf(newID);
			if (index > -1) {
				// if the index # is successfully identified, then add the whole interpretation object to the list of interpretations for the browser window...

				this.formerInterpretationsList.push(this.interpretationsList[index]);
				// ... and remove it from the list of interpretations currently in the Dropdown menu
				this.interpretationsList.splice(index, 1); // 2nd parameter means remove one item only
			}

			// tell the Vuex store to add the ID number of the interpretation in question to the list of interpretions that currently need columns in the browser window
			this.$store.commit("addConsolesCount", newID);
		},

		// add a whole interpretation object (which was emitted by the child component that just created it and also created a new column for it) to the list of interpretations that are being viewed in the browser window
		addCreatedInterpretation(interpretation) {
			this.formerInterpretationsList.push(interpretation);
			this.$store.commit("addConsolesCount", interpretation.id);
		},

		updateTitleLanguagefunc({ id, title, language }) {
			// console.log("inside")
			let mappedoldIDsArray = this.formerInterpretationsList.map(
				(item) => item.id
			);
			// find the index # of the ID to be returned to the dropdown menu (and removed from the viewer)
			let indexofold = mappedoldIDsArray.indexOf(id);
			if (indexofold > -1) {
				// ... and remove it from the list of interpretations currently being viewed
				// console.log(this.formerInterpretationsList[indexofold])
				this.formerInterpretationsList[indexofold].title = title
				this.formerInterpretationsList[indexofold].language_name = language
				console.log("updating " + this.formerInterpretationsList[indexofold].version + " to " + (this.formerInterpretationsList[indexofold].version + 1))
				this.formerInterpretationsList[indexofold].version = this.formerInterpretationsList[indexofold].version + 1
				console.log("now it is " + this.formerInterpretationsList[indexofold].version)
			}
		},

		toggleUploadIntModal() {
			this.showUploadIntModal = !this.showAddInterpretationModal;
		},
		closeUploadIntModal() {
			this.showUploadIntModal = false;
		},
		toggleInterpretationModal() {
			this.showAddInterpretationModal = !this.showAddInterpretationModal;
		},
		closeInterpretationModal() {
			this.showAddInterpretationModal = false;
		},
	},
};
</script>

<style scoped>



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

.hero {
	/* position: relative; */
	background-color: transparent;
	/* margin-top:-25px; */
	/* height: 33vh; */
	/* padding-top: 29px; */
	/* padding-bottom: 14px; */
	/* url('../assets/dito_logo_main.svg'); */
}

.hero::before {
	content: " ";
	z-index: -1;
	position: absolute;
	width: 100%;
	height: 20vh;
	background-image: linear-gradient(rgb(0.784% 51.765% 78.039%) 0%,
			rgb(0.941% 52.027% 78.356%) 6.25%,
			rgb(1.421% 52.81% 79.296%) 12.5%,
			rgb(2.258% 54.105% 80.826%) 18.75%,
			rgb(3.506% 55.892% 82.891%) 25%,
			rgb(5.241% 58.149% 85.417%) 31.25%,
			rgb(7.56% 60.843% 88.304%) 37.5%,
			rgb(12.183% 63.425% 89.834%) 43.75%,
			rgb(21.156% 65.241% 87.961%) 50%,
			rgb(30.833% 67.456% 86.332%) 56.25%,
			rgb(41.028% 70.131% 85.13%) 62.5%,
			rgb(51.535% 73.33% 84.563%) 68.75%,
			rgb(62.126% 77.128% 84.859%) 75%,
			rgb(72.551% 81.603% 86.268%) 81.25%,
			rgb(82.538% 86.843% 89.062%) 87.5%,
			rgb(91.792% 92.942% 93.534%) 93.75%,
			rgb(100% 100% 100%) 100%);
}
</style>