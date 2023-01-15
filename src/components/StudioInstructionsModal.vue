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
			<h1 class="text-2xl font-bold">Studying Instructions</h1>
			<br />
			<p class="text-sm -mt-[1vh] text-justify pb-[3vh]">
				1. Press "Ctrl" and left-click to play or pause the audio player at any time.<br><br>
				2. Retype exactly whichever phrase most closely matches what you are hearing.<br><br>

				3. If you are correct, you will automatically receive a new prompt (no need to press "Enter").<br><br>
				4. Click "New Phrase" above to skip the current prompt.<br><br>
				5. Adjust the "listen to less / more" slider above to change the length of phrase that you are prompted with (note that adjusting this slider will always bring you back to the beginning of the audio file).<br><br>
			</p>
		</div>
	</div>
</template>

<script>
export default {
	name: "StudioInstructionsModal",
	components: {},
	data() {
		return {};
	},
	props: {},
	methods: {
		closeModal() {
			this.$emit("closeStudioModal");
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