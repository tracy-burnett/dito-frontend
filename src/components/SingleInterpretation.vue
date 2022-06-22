<template>
	<div class="h-full">
		<!-- this SingleInterpretation component represents what is viewable in a single interpretation column of an open storybook -->


					<div
			class="flex flex-rows-1 flex-wrap justify-around sticky top-12 z-20" style="background: white"
		>

			<!-- this component allows the user to remove the entire interpretation column from their browser window -->


			

			<!-- SelectInterpretationMenu allows the user to swap out the interpretation they are currently viewing for a different one -->
			<!-- this SingleInterpretation component tells the SelectInterpretationMenu component what interpretations to place in its Dropdown menu via interpretationsList -->
			<!-- the user's selection of a new interpretation is communicated back to this SingleInterpretation component via the changeInterpretationID event -->
			<div>
				<SelectInterpretationMenu
					:interpretationsList="interpretationsList"
					@changeInterpretationID="changeInterpretationIDfunction($event)"
				/>
			</div>
						<!-- the StorybookStyleMenu component allows the user to choose whether they want to interact with the interpretation via the Viewer, Tagger, or Editor feature -->
			<!-- the user's selection is communicated back to this SingleInterpretation component via the toggleStorybookStyle event -->
			<div>
				<StorybookStyleMenu
					:interpretationStatus="interpretationStatus"
					@toggleStorybookStyle="toggleStorybookStylefunction($event)"
				/>
			</div>
						<div>
				<DeleteInterpretationViewer
					:interpretation_id="interpretation_id"
					@returnFormerInterpretation="returnFormerInterpretation($event)"
				/>
			</div></div>					<div
			class="flex flex-rows-1 flex-wrap justify-around sticky top-24 z-10" style="background: white"
		>
<!-- <div class="w-40"></div> -->

			<div>
				change font size<br>
				<input
					id="fontsizeslider"
					v-model="fontsize"
					type="range"
					min="8"
					max="50"
					step=".5"
				/>
			</div>


			<!--highlight more/less slider -->
			<div v-if="styleoption==='Viewer'">
				<div class="flex">
					highlight less / more
				</div>
				<div>
					<input
						id="timestepslider"
						v-model="timestep"
						type="range"
						min="50"
						max="10000"
						step="50"
					/>
				</div>
			</div>
			<div
				v-else-if="styleoption==='Editor'"
			>
				<!-- this is where should allow user to choose other punctuating characters or strings to always be their own word and not accidentally joining two other words -->
				<button class="dropbtn bg-slate-600" @click="saveEditsincrease()">
					Save
				</button>
			</div>

			<div
				v-if="styleoption==='Tagger'"
			>
				<!-- quick and dirty way to undo tags you haven't saved to the database yet -->
				<button class="dropbtn bg-slate-600" @click="clearTimestamps()">Clear New</button>
			</div>
			<!-- quick and dirty way to purge the database of all tags for this interpretation, mainly used for debugging purposes -->
			<div
				v-if="styleoption==='Tagger'"
			><button  class="dropbtn bg-slate-600" @click="clearOldTimestamps()">
					Clear Old
				</button></div>
						<div
				v-if="styleoption==='Tagger'"
			><button class="dropbtn bg-slate-600" @click="updateAssociationsfunc()">
					Save
				</button></div>
		</div>
			
		<br /><br /><br /><br /><br />
		<div class="sticky top-40">
			<!-- this component will be Viewer, Tagger, or Editor, depending on the user's selection of "styleoption" via the StorybookStyleMenu -->
			<!-- {{interpretationStatus}} -->
			<!-- {{$store.state.user}} -->
			<component
				v-bind:is="styleoption"
				:audio_id="audio_id"
				:timestep="timestep"
				:fontsize="fontsize"
				:clearTimestampsvar="clearTimestampsvar"
				:updateAssociations="updateAssociations"
				:clearOldTimestampsvar="clearOldTimestampsvar"
				:saveEditscounter="saveEditscounter"
				:interpretationStatus="interpretationStatus"
				:interpretation_id="interpretation_id"
				@permanentlydestroy="permanentlydestroy($event)"
			>
			
			
			</component>

		</div>
	</div>
</template>

<script>
import Viewer from "@/components/Viewer.vue";
import Editor from "@/components/Editor.vue";
import Tagger from "@/components/Tagger.vue";
import StorybookStyleMenu from "@/components/StorybookStyleMenu.vue";
import SelectInterpretationMenu from "@/components/SelectInterpretationMenu.vue";
import DeleteInterpretationViewer from "@/components/DeleteInterpretationViewer.vue";

export default {
	name: "SingleInterpretation",
	components: {
		Editor,
		Viewer,
		Tagger,
		StorybookStyleMenu,
		SelectInterpretationMenu,
		DeleteInterpretationViewer,
	},

	data: () => {
		return {
			timestep: 500,
			fontsize: 16,
			updateAssociations: 0,
			clearTimestampsvar: 0,
			saveEditscounter: 0,
			clearOldTimestampsvar: 0,
			interpretationStatus: "", // this remembers whether the currently logged-in user is a viewer, editor, or owner of the currently-displayed interpretation
			styleoption: "Viewer", // this can be Viewer, Editor, or Tagger, depending on how the user is currently interacting with the displayed interpretation
			interpretationFull: {}, // this contains all of the information about the currently displayed interpretation
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
		clearTimestamps() {
			this.clearTimestampsvar++;
		},
		clearOldTimestamps() {
			this.clearOldTimestampsvar++;
		},
		saveEditsincrease() {
			this.saveEditscounter++;
		},
		updateAssociationsfunc() {
			this.updateAssociations++;
		},
		toggleStorybookStylefunction(styleselection) {
			this.styleoption = styleselection;
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
			this.$emit("displayInterpretationID", newID); // ...tell the parent component to create a new column for the new interpretation the user wants to view
			this.returnFormerInterpretation(formerinterpretation); // ...tell the parent component to remove this column currently being worked in
		},

		returnFormerInterpretation(formerinterpretation) {
			this.$emit("returnFormerInterpretation", formerinterpretation);
		},

		permanentlydestroy(formerinterpretation) {
			this.$emit("permanentlydestroy", formerinterpretation);
		},
	},
};
</script>

<style scoped>
.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	margin: 4px 2px;
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
	min-width: 160px;
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
	z-index: 1;
}

.dropdown-content a {
	color: black;
	padding: 12px 16px;
	text-decoration: none;
	display: block;
}

.buttonplus {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 9px 12px;
	position: fixed;
	left: 600px;
	top: 300px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	margin: 4px 2px;
	cursor: pointer;
	border-radius: 16px;
}

.buttonplus {
	border-radius: 100%;
}

.dropdown-content a:hover {
	background-color: #f1f1f1;
}
.dropdown:hover .dropdown-content {
	display: block;
}
/* .dropdown:hover .dropbtn { */
	/* background-color: #7833ff; */
/* } */
</style>

