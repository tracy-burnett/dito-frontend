<template>
	<div>
		<span
			v-if="prompterHelp && tier=='project'"
			class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen"
		>
			<PrompterInstructionsModal @closePrompterModal="prompterHelp=false" />
		</span>
		<span
			v-if="editorHelp && tier=='project'"
			class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen"
		>
			<EditorInstructionsModal @closeEditorModal="editorHelp=false" />
		</span>
		<span
			v-if="taggerHelp && tier=='project'"
			class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen"
		>
			<TaggerInstructionsModal @closeTaggerModal="taggerHelp=false" />
		</span>
		<span
			v-if="viewerHelp"
			class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen"
		>
			<ViewerInstructionsModal @closeViewerModal="viewerHelp=false" />
		</span>
		<span
			v-if="studioHelp && tier=='project'"
			class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen"
		>
			<StudioInstructionsModal @closeStudioModal="studioHelp=false" />
		</span>

		<div
			class="dropdown"
			style="float: right"
		>
			<button
				@click="prompterHelp=true"
				v-if="styleselection=='Prompter' && tier=='project'"
				class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn pl-[.6vw] py-[1vh] pr-[2vw]"
			>{{$store.state.promptsObject.bScribing}}
				<img
					class="absolute w-[2.2vh] top-0 bottom-0 m-auto cursor-pointer right-0 mr-[.5vw]"
					src="@/assets/icon_help.svg"
					style="filter: brightness(0) invert(1)"
				/>
			</button>
			<button
				@click="editorHelp=true"
				v-else-if="styleselection=='Editor' && tier=='project'"
				class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn pl-[.6vw] py-[1vh] pr-[2vw]"
			>{{$store.state.promptsObject.bEditing}}
				<img
					class="absolute w-[2.2vh] top-0 bottom-0 m-auto cursor-pointer right-0 mr-[.5vw]"
					src="@/assets/icon_help.svg"
					style="filter: brightness(0) invert(1)"
				/></button>
			<button
				@click="taggerHelp=true"
				v-else-if="styleselection=='Tagger' && tier=='project'"
				class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn pl-[.6vw] py-[1vh] pr-[2vw]"
			>{{$store.state.promptsObject.bRefining}}
				<img
					class="absolute w-[2.2vh] top-0 bottom-0 m-auto cursor-pointer right-0 mr-[.5vw]"
					src="@/assets/icon_help.svg"
					style="filter: brightness(0) invert(1)"
				/></button>
			<button
				@click="viewerHelp=true"
				v-else-if="styleselection=='Viewer'"
				class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn pl-[.6vw] py-[1vh] pr-[2vw]"
			>{{$store.state.promptsObject.bViewing}}
				<img
					class="absolute w-[2.2vh] top-0 bottom-0 m-auto cursor-pointer right-0 mr-[.5vw]"
					src="@/assets/icon_help.svg"
					style="filter: brightness(0) invert(1)"
				/></button>
			<button
				@click="studioHelp=true"
				v-else-if="styleselection=='Studio' && tier=='project'"
				class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn pl-[.6vw] py-[1vh] pr-[2vw]"
			>{{$store.state.promptsObject.bStudying}}
				<img
					class="absolute w-[2.2vh] top-0 bottom-0 m-auto cursor-pointer right-0 mr-[.5vw]"
					src="@/assets/icon_help.svg"
					style="filter: brightness(0) invert(1)"
				/></button>
			<!-- <button
				v-else
				class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn px-[.6vw] py-[1vh]"
			>Interaction</button> -->
			<div class="dropdown-content" v-if="tier=='project'">

				<div class="absolute right-0 mr-[1vw] grid h-full">
					<img
						v-if="!otherIntInPrompter && (interpretationStatus == 'owner' || interpretationStatus == 'editor')"
						class="w-[2.2vh] top-0 bottom-0 m-auto cursor-pointer"
						src="@/assets/icon_help.svg"
						@click="prompterHelp=true"
					/>
					<img
						v-if="interpretationStatus == 'owner' || interpretationStatus == 'editor'"
						class="w-[2.2vh]  top-0 bottom-0 m-auto cursor-pointer"
						src="@/assets/icon_help.svg"
						@click="editorHelp=true"
					/>
					<img
						v-if="interpretationStatus == 'owner' || interpretationStatus == 'editor'"
						class=" w-[2.2vh] right-[1vw] top-0 bottom-0 m-auto cursor-pointer"
						src="@/assets/icon_help.svg"
						@click="viewerHelp=true"
					/>
					<img
						class=" w-[2.2vh] right-[1vw] top-0 bottom-0 m-auto cursor-pointer"
						src="@/assets/icon_help.svg"
						@click="taggerHelp=true"
					/>
					<img
						v-if="!otherIntInPrompter"
						class=" w-[2.2vh] right-[1vw] top-0 bottom-0 m-auto cursor-pointer"
						src="@/assets/icon_help.svg"
						@click="studioHelp=true" 
					/>
				</div>

				<a
					v-if="!otherIntInPrompter && (interpretationStatus == 'owner' || interpretationStatus == 'editor')"
					@click="toggleStorybookStyle('Prompter')" class="font-semibold"
				>
				{{$store.state.promptsObject.bScribing}}
				</a>
				<a
					v-if="interpretationStatus == 'owner' || interpretationStatus == 'editor'"
					@click="toggleStorybookStyle('Editor')" class="font-semibold"
				>{{$store.state.promptsObject.bEditing}}</a>
				
				<a @click="toggleStorybookStyle('Viewer')">{{$store.state.promptsObject.bViewing}}</a>
				<a
					v-if="interpretationStatus == 'owner' || interpretationStatus == 'editor'"
					@click="toggleStorybookStyle('Tagger')"
				>{{$store.state.promptsObject.bRefining}}</a>
				<a
					v-if="!otherIntInPrompter"
					@click="toggleStorybookStyle('Studio')"
				>{{$store.state.promptsObject.bStudying}}</a>

			</div>
		</div>
	</div>
</template>

<script>
import PrompterInstructionsModal from "@/components/PrompterInstructionsModal.vue";
import EditorInstructionsModal from "@/components/EditorInstructionsModal.vue";
import TaggerInstructionsModal from "@/components/TaggerInstructionsModal.vue";
import ViewerInstructionsModal from "@/components/ViewerInstructionsModal.vue";
import StudioInstructionsModal from "@/components/StudioInstructionsModal.vue";

export default {
	name: "StorybookStyleMenu",
	data: () => {
		return {
			tier: process.env.VUE_APP_TIER,
			prompterHelp: false,
			editorHelp: false,
			taggerHelp: false,
			viewerHelp: false,
			studioHelp: false,
			styleselection: "",
		};
	},
	computed: {
		otherIntInPrompter() {
			if (
				this.$store.state.prompterID == null ||
				this.$store.state.prompterID == this.interpretation_id
			) {
				return false;
			} else {
				return true;
			}
		},
	},
	components: {
		PrompterInstructionsModal,
		EditorInstructionsModal,
		TaggerInstructionsModal,
		ViewerInstructionsModal,
		StudioInstructionsModal,
	},
	props: {
		interpretationStatus: {
			default: "viewer",
		},
		interpretation_id: {
			default: null,
		},
	},
	methods: {
		toggleStorybookStyle(styleselection) {
			this.styleselection = styleselection;
			// tell the parent component to load Viewer, Editor, or Tagger, corresponding with what the user has selected in this dropdown menu
			this.$emit("toggleStorybookStyle", styleselection);
		},
	},
	mounted() {
		if (
			this.$store.state.infobit == "PublicCardList" ||
			this.$store.state.infobit == "Login"
		) {
			this.toggleStorybookStyle("Viewer");
		} else if (this.$store.state.infobit == "InfoRevitalize") {
			this.toggleStorybookStyle("Viewer");
			this.$store.commit("toggleInfobit", "PublicCardList");
		} else if (this.$store.state.infobit == "InfoPublish") {
			this.toggleStorybookStyle("Viewer");
			this.$store.commit("toggleInfobit", "PublicCardList");
		}
	},
};
</script>

<style scoped>
.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	/* padding: 1vh 1vh; */
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
	min-width: 160px;
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
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
/* .dropdown:hover .dropbtn { */
/* background-color: #7833ff; */
/* } */
</style>

