<template>

	<!-- clicking this button removes the interpretation column associated with it -->
	<div id="destroy">
		<button
			class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn"
			@click="destroy"
		>
		{{$store.state.promptsObject.bClose}}</button>
	</div>

</template>

<script>
export default {
	name: "DeleteInterpretationViewer",
	data: () => {
		return {};
	},
	mounted() {},
	props: {
		// id of the interpretation associated with this delete button
		interpretation_id: {
			default: "",
		},
	},
	methods: {
		destroy() {
			// tell the parent component to move this interpretation ID from a viewer column back to the dropdown menu of interpretations available to view
			this.$emit("returnFormerInterpretation", this.interpretation_id);
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

</style>

