<template>
	<div
		class="flex flex-col items-center justify-center flex-auto h-full backdrop"
		@click="closeModal"
	>
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Tagging Instructions</h1>
			<br />
			<p class="text-sm -mt-[1vh] text-justify pb-[3vh]">
				1. Press "Ctrl" and left-click to play or pause the audio player at any time.<br><br>
				
				2. Highlight a region of the audio file.<br><br>

				3. Then, click or click-and-drag on the words that represent the meaning in the audio selection, and the words will turn green.<br><br>

				4. To unselect words, click on them or hold "ALT" and drag over them, and they will turn black again.<br><br>

				5. To unselect all of the words at once, click "Clear New" above.<br><br>
				6. When you are satisfied with your selection, click the "Save" button above.<br><br>
				7. Repeat.
			</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "TaggerInstructionsModal",
	components: {},
	data() {
		return {};
	},
	props: {},
	methods: {
		closeModal() {
			this.$emit("closeTaggerModal");
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