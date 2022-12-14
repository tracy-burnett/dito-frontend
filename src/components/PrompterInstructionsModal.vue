<template>
	<div class="flex flex-col items-center justify-center flex-auto h-full backdrop" @click="closeModal">
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md modal rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Scribing Instructions</h1>
			<br />
            <p class="text-sm -mt-[1vh] text-justify pb-[3vh]">
			1. Write down the words that you hear, then press "Enter."<br><br>
			2. If you want to move to a new prompt without saving data, then leave the text box blank and press "Enter" or click on the "New Prompt" button above.<br><br>
			3. If you choose to receive very short prompts on the "scribe less / more" slider above, the prompter may skip some portions of the audio file to give you phrases of the right length.<br><br>
			4. If you want to adjust the segment of the audio being played to better fit the words, either drag the "scribe less / more" slider above or manually adjust the highlighted region in the audio player to the left by editing the timestamps at the top or bottom or clicking and dragging the highlighted region or its edges.
		</p>
		</div>
	</div>
</template>

<script>

export default {
	name: "PrompterInstructionsModal",
	components: {},
	data() {
		return {
		};
	},
	props: {
	},
	methods: {
	
		closeModal() {
			this.$emit("closePrompterModal");
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