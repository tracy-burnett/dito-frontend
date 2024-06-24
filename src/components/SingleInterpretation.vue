<template>
	<div class="h-full singleint">
		<span v-if="showSyncingModal" class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen">
			<SyncingModal :audio_id="audio_id" :interpretation_id="interpretation_id"
				:editingversion="interpretationFull.version" :title="interpretationFull.version"
				:language_name="interpretationFull.language_name" @updateTitleLanguage="updateTitleLanguagefunc($event)"
				@closeSyncingModal="closeSyncingModal()" />
		</span>
		<!-- the current component represents what is viewable in a single interpretation column of an open storybook -->
		<div class="flex flex-col -mt-[0vh]">
			<div class="flex flex-row justify-center ">
				<div class="sticky flex flex-row flex-wrap justify-around shrink ">

					<div
						v-if="styleoption === 'Viewer' && (this.interpretationStatus == 'owner' || this.interpretationStatus == 'editor')">

						<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" @click="toggleSyncingModal()"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
							{{ $store.state.promptsObject.bAdjust }}
						</button>
					</div>
					<div>
						<DeleteInterpretationViewer :interpretation_id="interpretation_id"
							@returnFormerInterpretation="returnFormerInterpretation($event)" />
					</div>

					<div v-if="styleoption === 'Tagger'">
						<!-- quick and dirty way to undo tags you haven't saved to the database yet -->
						<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" @click="clearTimestamps()"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">{{
			$store.state.promptsObject.bClearNew }}</button>
					</div>
					<div v-if="interpretationsList.length > 0">
						<SelectInterpretationMenu :interpretationsList="interpretationsList"
							@changeInterpretationID="changeInterpretationIDfunction($event)" />
					</div>

				</div>

				<div class="sticky flex flex-row flex-wrap-reverse justify-around shrink top-12">

					<div v-if="styleoption === 'Prompter'">
						<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" @click="resetSensitivity()"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
							{{ $store.state.promptsObject.bResetSensitivity }}
						</button>
					</div>

					<div>
						<StorybookStyleMenu :interpretationStatus="interpretationStatus"
							:interpretation_id="interpretation_id"
							@toggleStorybookStyle="toggleStorybookStylefunction($event)" />
					</div>
					<div
						v-if="(tier == 'research' || tier == 'project') && (styleoption === 'Viewer') && (this.interpretationStatus == 'owner' || this.interpretationStatus == 'editor')">

						<div class="dropdown" style="float: right">
							<button class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn"
								:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">{{
			$store.state.promptsObject.bDownload }}</button>
							<div class="dropdown-content">
								<a @click="downloadSRT()">overlapping .srt</a>
							</div>
						</div>
					</div>

					<div v-if="styleoption === 'Prompter'">
						<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" @click="newPrompt()"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
							{{ $store.state.promptsObject.bNewPrompt }}
						</button>
					</div>

					<div v-if="styleoption === 'Studio'">
						<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }"
							@click="newPhrase()">
							{{ $store.state.promptsObject.bNewPhrase }}
						</button>
					</div>

					<div v-if="styleoption === 'Editor'">
						<button class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" @click="saveEditsincrease()"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
							{{ $store.state.promptsObject.bSave }}
						</button>
					</div>

					<div v-if="styleoption === 'Tagger'"><button
							class="dropbtn border-sky-600 bg-sky-700 hover:bg-sky-600" @click="updateAssociationsfunc()"
							:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
							{{ $store.state.promptsObject.bSave }}
						</button></div>
				</div>
			</div>
			<div class="flex flex-row flex-wrap justify-center">

				<div
					:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
					{{ $store.state.promptsObject.sChangeFontSize }}<br>
					<input id="fontsizeslider" v-model="fontsize" type="range" min="8" max="50" step=".5" />
				</div>

				<!--highlight more/less slider -->
				<div v-if="styleoption === 'Viewer'">
					<div class="flex"
						:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
						{{ $store.state.promptsObject.sHighlightLessMore }}
					</div>
					<div>
						<input id="timestepslider" v-model="timestep" type="range" min="0" max="2500" step="10" />
					</div>
				</div>

				<div v-if="styleoption === 'Prompter'">
					<div class="flex"
						:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
						{{ $store.state.promptsObject.sScribeLessMore }}
					</div>
					<div>
						<input id="scribingslider" v-model="scribingold" type="range" min="20" max="750" step="10"
							@mouseup="changescribinglength()" /><!-- do not let min go to less than 20, since then it will be within the margin of error of the scriber auto-segmenter -->
					</div>

				</div>

				<div v-if="styleoption === 'Studio'">
					<div class="flex"
						:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
						&nbsp;&nbsp;&nbsp;{{ $store.state.promptsObject.sPhraseLength }}
					</div>
					<div>
						<input id="studyingslider" v-model="studyingold" type="range" min="0" max="2000" step="10"
							@mouseup="changestudyinglength()" />
					</div>

				</div>
			</div>
		</div>
		<div class="mt-[6vh]">
			<!-- this component will depend on the user's selection of component to vue via a menu in a different component -->
			<component v-bind:is="styleoption" :audio_id="audio_id" :timestep="timestep" :scribing="scribing"
				:studying="studying" :fontsize="fontsize" :key="prompterReloadCounter"
				:clearTimestampsvar="clearTimestampsvar" :updateAssociations="updateAssociations"
				:saveEditscounter="saveEditscounter" :newPromptscounter="newPromptscounter"
				:resetSensitivitycounter="resetSensitivitycounter" :downloadSRTcounter="downloadSRTcounter"
				:newPhrasescounter="newPhrasescounter" :interpretationStatus="interpretationStatus"
				:interpretation_id="interpretation_id" :editingversion="interpretationFull.version"
				@permanentlydestroy="permanentlydestroy($event)" @increasePhrasesCounter="newPhrase()"
				@generateNewPrompt="newPrompt()" @reloadPrompter="prompterReloadCounter++"
				@updateTitleLanguage="updateTitleLanguagefunc($event)">

			</component>

		</div>
	</div>
</template>

<script>
import SyncingModal from "@/components/SyncingModal.vue";
import Viewer from "@/components/Viewer.vue";
import Editor from "@/components/Editor.vue";
import Tagger from "@/components/Tagger.vue";
import Prompter from "@/components/Prompter.vue";
import Studio from "@/components/Studio.vue";
import StorybookStyleMenu from "@/components/StorybookStyleMenu.vue";
import SelectInterpretationMenu from "@/components/SelectInterpretationMenu.vue";
import DeleteInterpretationViewer from "@/components/DeleteInterpretationViewer.vue";

export default {
	name: "SingleInterpretation",
	components: {
		Editor,
		Viewer,
		Tagger,
		SyncingModal,
		Prompter,
		Studio,
		StorybookStyleMenu,
		SelectInterpretationMenu,
		DeleteInterpretationViewer,
	},

	data: () => {
		return {
			tier: process.env.VUE_APP_TIER,
			timestep: 0,
			scribing: 100,
			scribingold: 100,
			studying: 200,
			studyingold: 200,
			fontsize: 16,
			updateAssociations: 0,
			clearTimestampsvar: 0,
			newPromptscounter: 0,
			resetSensitivitycounter: 0,
			downloadSRTcounter: 0,
			newPhrasescounter: 0,
			// submitcounter: 0,
			saveEditscounter: 0,
			// clearOldTimestampsvar: 0,
			interpretationStatus: "", // this remembers whether the currently logged-in user is a viewer, editor, or owner of the currently-displayed interpretation
			styleoption: "Viewer", // this can be Viewer, Editor, or Tagger, depending on how the user is currently interacting with the displayed interpretation
			interpretationFull: {}, // this contains all of the information about the currently displayed interpretation
			showSyncingModal: false,
			prompterReloadCounter: 0, // reloads prompter component
		};
	},

	props: {
		audio_id: {
			default: "",
		},
		interpretation_id: {
			default: "",
		},
		// list of interpretations to be displayed in the dropdown menu
		interpretationsList: {
			default: [],
		},

		// list of interpretations currently displayed in columns in the viewer
		formerInterpretationsList: {
			default: [],
		},
	},
	computed: {},

	mounted() {
		// get all the information about the interpretation displayed in this particular column in the browser
		this.interpretationFull = this.formerInterpretationsList.filter(
			(element) => element.id == this.interpretation_id
		)[0];

		// call a function to identify whether the currently logged-in user is a viewer, editor, or owner of the interpretation displayed in this column in the browser
		this.sharingSetting(
			this.interpretationFull.created_by.user_ID,
			this.interpretationFull.shared_editors,
			this.interpretationFull.shared_viewers,
			this.interpretationFull.public
		);
	},
	methods: {
		toggleSyncingModal() {
			this.showSyncingModal = !this.showSyncingModal;
		},
		closeSyncingModal() {
			this.showSyncingModal = false;
		},
		clearTimestamps() {
			this.clearTimestampsvar++;
		},
		// clearOldTimestamps() {
		// 	this.clearOldTimestampsvar++;
		// },
		saveEditsincrease() {
			this.saveEditscounter++;
		},

		changescribinglength() { this.scribing = this.scribingold },

		changestudyinglength() { this.studying = this.studyingold },

		downloadSRT() {
			this.downloadSRTcounter++;
		},
		// 		submitincrease() {
		// 	this.submitcounter++;
		// },
		newPrompt() {
			this.newPromptscounter++;
		},
		resetSensitivity() {
			this.resetSensitivitycounter++;
		},
		newPhrase() {
			this.newPhrasescounter++;
		},
		updateAssociationsfunc() {
			this.updateAssociations++;
		},
		toggleStorybookStylefunction(styleselection) {
			this.styleoption = styleselection;
			if (this.styleoption == "Prompter" || this.styleoption == "Studio") {
				this.$store.commit("updatePrompterID", this.interpretation_id);
			} else if (
				this.styleoption != "Prompter" &&
				this.styleoption != "Studio" &&
				this.$store.state.prompterID == this.interpretation_id
			) {
				this.$store.commit("removePrompterID");
			}
		},

		sharingSetting(owner, editors, viewers, publictf) {
			if (this.$store.state.user !== null) {
				if (owner == this.$store.state.user.uid) {
					this.interpretationStatus = "owner";
				} else if (
					editors &&
					editors
						.map((item) => item.user_ID)
						.includes(this.$store.state.user.uid)
				) {
					this.interpretationStatus = "editor";
				} else if (
					(viewers &&
						viewers
							.map((item) => item.user_ID)
							.includes(this.$store.state.user.uid)) ||
					publictf == true
				) {
					this.interpretationStatus = "viewer";
				}
			} else if (publictf == true) {
				this.interpretationStatus = "viewer";
			}
		},

		// when the user chooses to swap the interpretation they are currently viewing for a different interpretation...
		changeInterpretationIDfunction(newID) {
			let formerinterpretation = this.interpretation_id;
			// this.$emit("displayInterpretationID", newID); // ...tell the parent component to create a new column for the new interpretation the user wants to view
			// this.returnFormerInterpretation(formerinterpretation); // ...tell the parent component to remove this column currently being worked in
			this.$emit("exchangeInterpretations", { newID, formerinterpretation })

		},

		returnFormerInterpretation(formerinterpretation) {
			this.$emit("returnFormerInterpretation", formerinterpretation);
		},

		permanentlydestroy(formerinterpretation) {
			this.$emit("permanentlydestroy", formerinterpretation);
		},

		updateTitleLanguagefunc({ id, title, language }) {
			// console.log("right there")
			this.$emit("updateTitleLanguage", { "id": id, "title": title, "language": language })
		},
	},
};
</script>

<style scoped>
.singleint {
	-ms-overflow-style: none;
	/* for Internet Explorer, Edge */
	scrollbar-width: none;
	/* for Firefox */
	overflow-y: scroll;
}

.singleint::-webkit-scrollbar {
	display: none;
	/* for Chrome, Safari, and Opera */
}

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

.dropdown {
	position: relative;
	display: inline-block;
}

.dropdown-content {
	display: none;
	position: absolute;
	right: 0;
	background-color: #f9f9f9;
	/* min-width: 160px; */
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
	z-index: 45;
}

.dropdown-content a {
	color: black;
	padding: 12px 16px;
	text-decoration: none;
	display: block;
}

.dropdown-content a:hover {
	background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
	display: block;
}

.tibetan {
	font-size: 1.25rem
		/* 14px */
	;
	line-height: 1.75rem
		/* 20px */
	;
}

.nottibetan {
	font-size: 0.875rem
		/* 14px */
	;
	line-height: 1.25rem
		/* 20px */
	;
}

@media (min-width: 768px) {
	.nottibetan {
		font-size: 1rem
			/* 16px */
		;
		line-height: 1.5rem
			/* 24px */
		;
	}

	.tibetan {
		font-size: 1.5rem
			/* 14px */
		;
		line-height: 2rem
			/* 20px */
		;
	}
}

.tibetantiny {
	font-size: 1.125rem
		/* 14px */
	;
	line-height: 1.75rem
		/* 20px */
	;
}

.nottibetantiny {
	font-size: 0.75rem
		/* 14px */
	;
	line-height: 1rem
		/* 20px */
	;
}

/* .dropdown:hover .dropbtn { */
/* background-color: #7833ff; */
/* } */
</style>
