<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop" @click="closeModal">
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Editing Instructions</h1>
			<br />
			<p class="text-sm -mt-[1vh] text-justify pb-[3vh]">
				1. Press "Ctrl" and left-click to play or pause the audio player at any time.<br><br>
				2. Edit the title, language name, or text of the interpretation. We will make every attempt to preserve the timestamps of the words as you move them around.
				<br><br>3. Use new lines (carriage returns) to separate words that are not separated by the language's spacing character.
				<br><br>4. Don't forget to click the "Save" button above after you make your changes!
			</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "EditorInstructionsModal",
	components: {},
	data() {
		return {};
	},
	props: {},
	methods: {
		closeModal() {
			this.$emit("closeEditorModal");
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