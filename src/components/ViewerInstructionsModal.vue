<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop" @click="closeModal">
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Viewing Instructions</h1>
			<br />
            <p class="text-sm -mt-[1vh] text-justify pb-[3vh]">
				1. Press "Ctrl" and left-click to play or pause the audio player at any time.<br><br>
				2. Click on the phrases below to skip to the part of the audio file that contains them.<br><br>
				3. Change the slider above that says "highlight less / more" to highlight and refer to the text in shorter or longer phrases as words are being spoken.<br><br>
				
				4. When the text below is highlighted in phrases of a length that you like, then select an option from the "Download" menu to save the interpretation to your computer.
			</p>
		</div>
	</div>
</template>

<script>

export default {
	name: "ViewerInstructionsModal",
	components: {},
	data() {
		return {
		};
	},
	props: {
	},
	methods: {
	
		closeModal() {
			this.$emit("closeViewerModal");
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