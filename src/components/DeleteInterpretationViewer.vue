<template>

	<!-- clicking this button removes the interpretation column associated with it -->
	<div id="destroy">
		<button
			class="border-sky-600 bg-sky-700 hover:bg-sky-600 dropbtn"
			@click="destroy" :class="{ tibetan: $store.state.promptsObject.name=='བོད་ཡིག', nottibetan: $store.state.promptsObject.name!='བོད་ཡིག' }"
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

.tibetan {
	font-size: 1.25rem/* 14px */;
    line-height: 1.75rem/* 20px */;
}
.nottibetan {
	font-size: 0.875rem/* 14px */;
    line-height: 1.25rem/* 20px */;
}
@media (min-width: 768px) {
    .nottibetan {
        font-size: 1rem/* 16px */;
        line-height: 1.5rem/* 24px */;
    }
	.tibetan {
	font-size: 1.5rem/* 14px */;
    line-height: 2rem/* 20px */;
}
}
</style>

