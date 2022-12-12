<template>
	<div
		class="flex flex-col items-center justify-center flex-1 flex-auto h-full backdrop"

	>
		<div class="flex flex-col items-center p-8 overflow-y-scroll bg-white border border-gray-300 shadow-md rounded-xl xl:w-2/5 lg:w-2/4 md:w-2/3">
			<button
				class="mx-4 my-2 text-xl text-gray-500"
				@click.prevent="closeModal()"
			>
				×
			</button>
			<h1 class="text-2xl font-bold">Adjust All Timestamps</h1>
			<br /><br>
            
            How many seconds do you want to adjust the text by?  You may use decimals and negative numbers.<br>
            Requests to adjust the text beyond the duration of the audio file will be ignored.
			<input
				class="w-full px-3 py-1 mt-12 mb-3 border border-gray-300 rounded"
                v-model="offset"
			/>

			<button
				class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors border rounded bg-cyan-700 border-cyan-600 hover:bg-cyan-600"
				@click="sendOffset()"
			>
				Adjust Text
			</button>
		</div>
	</div>
</template>

<script>
import { getIdToken } from "firebase/auth";

export default {
	name: "SyncingModal",
	components: {},
	data() {
		return {
            offset: 0,
		};
	},
	props: {
		audio_id: {
			default: "",
		},
        interpretation_id: {default: "",}
	},
    
	computed: {
		offset_clean() {
            return parseInt(this.offset*100)
		},
	},
	methods: {

sendOffset() {
    if (this.$store.state.audioDuration>0)
{			fetch(
				process.env.VUE_APP_api_URL +
					"content/" +
					this.audio_id +
					"/" +
					this.interpretation_id,
				{
					method: "POST",
					body: JSON.stringify({
						// text: this.latest_text.normalize("NFC"), // Pass in a string that meets a minimum character count and includes all the new tags you want to save
						// associations: this.new_associations, // Pass in the list of the new tags
                        offset: this.offset_clean,
                        duration: this.$store.state.audioDuration,
					}),

					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
				}
			)
				.then((response) => response)
				.then((data) => console.log(data))
				.then(() => {
                    this.$store.commit("reloadViewer")
				this.closeModal()
				})
				.catch((error) => console.error("Error:", error));}
		},



		closeModal() {
			this.$emit("closeSyncingModal");
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
</style>