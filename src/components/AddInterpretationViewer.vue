<template>
	<div class="fixed right-0 w-[100px] flex flex-col  justify-center top-[23vh]">
		<!-- this is a button for creating a new Interpretation and having it displayed in its own column -->
		<div v-if="$store.state.user && tier == 'project'" class="flex flex-col items-left py-[2vh]" id="create"
			@click="show" style="cursor:pointer">
			<div class="w-[7.5vh]">
				<img src="@/assets/icon_add_no_fill.svg" />
			</div>
			<p class="text-left md:text-base"
				:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
				{{ $store.state.promptsObject.oCreateNewInterpretation }}</p>
		</div>
		<!-- this is a button for creating a new Interpretation and having it displayed in its own column -->
		<div v-if="$store.state.user" class="flex flex-col items-left py-[2vh]" id="upload" @click="upload"
			style="cursor:pointer">
			<div class="w-[7.5vh]">
				<img src="@/assets/icon_add_no_fill.svg" />
			</div>
			<p class="text-left md:text-base"
				:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
				{{ $store.state.promptsObject.oUploadInterpretationFile }}</p>
		</div>
		<!-- this is a button for adding another column that shows an Interpretation that you have access to but aren't yet viewing -->
		<div class="flex flex-col items-left pt-[2vh]" v-show="interpretationsList[0] && ($store.state.consoleswidth>=465 || $store.state.consoles.length==0)" id="add" @click="add"
			style="cursor:pointer">
			<div class="w-[7.5vh]">
				<img src="@/assets/icon_add_fill.svg" />
			</div>
			<p class="text-left md:text-base"
				:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
				{{ $store.state.promptsObject.oAddAnotherConsole }}</p>
		</div>
		<br />
	</div>
</template>

<script>
export default {
	name: "AddInterpretationViewer",
	data: () => {
		return {
			tier: process.env.VUE_APP_TIER,
		};
	},
	props: {
		interpretationsList: {
			// the list of interpretations that can be added as new columns. this does not include interpretations that are already being viewed.
			default: [],
		},
	},
	mounted() { },
	methods: {
		show() {
			this.$emit("toggleInterpretationModal");
		},
		upload() {
			if (this.$store.state.user && this.$store.state.audioDuration > 0) { this.$emit("toggleUploadIntModal"); }
		},
		add() {
			if (this.interpretationsList[0]) {
				let newID = this.interpretationsList[0].id; // prepare to display whichever interpretation was listed FIRST in the dropdown menu in a viewer
				this.$emit("displayInterpretationID", newID); // tell the parent component that the interpretation with that ID is now displayed in a viewer, and should no longer be available in the dropdown menu
			} else {
				this.show();
			}
		},
	},
};
</script>

<style scoped>
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
</style>
