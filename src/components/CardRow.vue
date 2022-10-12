<template>
	<div>
		<span
			v-if="$store.state.showStorybookModal == audio_ID"
			class="fixed inset-0 z-10 flex items-center justify-center w-full h-screen"
		>
			<StorybookModal
				:audio_id="audio_ID"
				:status="status"
				:shared_editors="shared_editors"
				:shared_viewers="shared_viewers"
			/>
		</span>
		<span
			v-if="$store.state.showAddViewersModal == audio_ID"
			class="fixed inset-0 z-10 flex items-center justify-center w-full h-screen"
		>
			<AddViewersModal
				:audio_id="audio_ID"
				:status="status"
				:shared_viewers="shared_viewers"
			/>
		</span>
		<div
			class="relative overflow-hidden transition-colors bg-white border cardrow rounded-xl mr-7"
			:class="{ editing: dropdown, notediting: !dropdown }"
		>
			<slot></slot>
			<!-- <img class="w-full h-1/2" :src="image" alt="Sunset in the mountains" /> -->
			<div class="grid items-center grid-cols-8 px-4 py-2 ml-20">
				<div v-if="!archived">
					<button
						class="w-1/2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
						@click="openstorybook()"
					>
						View
					</button>
				</div>
				<div v-else></div>
				<div v-if="
            !archived && dropdown && (status == 'owner' || status == 'editor')
          ">
					<textarea
						class="w-full font-bold border-gray-300 rounded"
						rows="3"
						style="overflow: hidden"
						v-model="title"
						@focusout="savechanges()"
					></textarea>
				</div>
				<div v-else>
					<p class="font-bold">{{ title }}</p>
				</div>
				<div v-if="
            !archived && dropdown && (status == 'owner' || status == 'editor')
          ">
					<textarea
						class="w-full border-gray-300 rounded"
						rows="3"
						style="overflow: hidden"
						v-model="description"
						@focusout="savechanges()"
					></textarea>
				</div>
				<div v-else>
					<p>{{ description }}</p>
				</div>
				<p>{{ uploader }}</p>
				<!-- <p>{{ date }}</p> -->
				<p>{{ last_edited }}</p>
				<span v-if="!archived && status == 'owner'">
					<input
						type="checkbox"
						id="publictf"
						value="publictf"
						v-model="publictf"
						@change="savechanges()"
					/>

					<span v-if="publictf"> yes</span>
					<span v-else> no</span>
				</span>
 
				<span v-else>
					<span v-if="publictf"> yes</span>
					<span v-else> no</span></span>
				<!-- <p class="">
        {{ publictf }}
      </p> -->
				<div>
					<div v-if="!archived && status == 'owner'">
						<!-- <button
            class="w-2/3 px-3 py-2 text-sm font-medium text-white transition-colors bg-indigo-500 border border-indigo-400 rounded hover:bg-indigo-400"
            @click="savechanges()"
          >
            Save Edits</button
          ><br> -->
						owner access<br><button
							class="w-2/3 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
							@click="archive()"
						>
							Archive
						</button>
					</div>
					<div v-else-if="archived && status == 'owner'">
						<button
							class="w-1/2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-blue-500 rounded hover:bg-blue-500"
							@click="unarchive()"
						>
							Restore
						</button>
					</div>
					<div v-else>{{status}} access</div>
				</div>
				<p v-if="status == 'owner'"><button @click="showStorybookModal(audio_ID)">Manage Collaborators</button></p>
				<p v-else-if="status == 'editor'"><button @click="showAddViewersModal(audio_ID)">Manage Viewers</button></p>
				<!-- <p v-else-if="status == 'viewer'"><button>Request to Collaborate</button></p> -->
			</div>
		</div>
		<div v-if="dropdown == true">
			<div
				v-for="interpretation in interpretationsList"
				:key="interpretation.id"
			>
				<IntManager
					:interpretation="interpretation"
					:audio_ID="audio_ID"
					:shared_editors="interpretation.shared_editors"
					:shared_viewers="interpretation.shared_viewers"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import IntManager from "@/components/IntManager.vue";
import StorybookModal from "@/components/StorybookModal.vue";
import AddViewersModal from "@/components/AddViewersModal.vue";

export default {
	name: "CardRow",
	components: { IntManager, StorybookModal, AddViewersModal },
	watch: {
		dropdown: function () {
          this.$store.commit("forceDashboardRerender");
		},
	},
	computed: {
		// the beginning of the highlighted region as manually typed in by the user, in seconds
		dropdown() {
			return this.audio_ID == this.picked;
		},
	},
	data: () => {
		return {
			interpretationsList: [],
			// random: "12345"
		};
	},
	props: {
		title: {
			default: "",
		},

		picked: {
			default: "",
		},

		description: {
			default: "",
		},

		shared_editors: {
			default: [],
		},

		shared_viewers: { default: [] },

		last_edited: { default: "" },

		publictf: {
			default: "",
		},

		uploader: {
			default: "",
		},

		archived: {
			default: false,
		},

		date: {
			default: "",
		},

		status: { default: "" },

		audio_ID: {
			default: "",
		},
	},

	mounted() {
		this.getInterpretations();
	},

	methods: {
		showStorybookModal() {
			this.$store.commit("showStorybookModal", this.audio_ID);
		},
		showAddViewersModal() {
			this.$store.commit("showAddViewersModal", this.audio_ID);
		},
		getInterpretations() {
			if (this.dropdown) {
				const apiUrl =
					process.env.VUE_APP_api_URL +
					"interpretations/audio/" +
					this.audio_ID +
					"/";
				fetch(apiUrl, {
					method: "GET",

					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
				})
					.then((response) => response.json())
					.then((data) => {
						// console.log("data")
						// console.log(data["interpretations"])
						this.interpretationsList = data["interpretations"];
						// console.log(this.interpretationsList)
					})
					.catch((error) => console.error("Error:", error));
			}
		},

		openstorybook() {
			this.$router.push({
				name: "Storybook",
				params: { audio_ID: this.audio_ID },
			});
		},

		unarchive() {
			fetch(
				process.env.VUE_APP_api_URL +
					"audio/" +
					this.audio_ID +
					"/" +
					this.status +
					"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						// title: this.title,
						// description: this.description,
						// public: this.publictf,
						archived: false,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})
				.then((response) => {
					this.$store.commit("forceDashboardRerender");
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

		archive() {
			fetch(
				process.env.VUE_APP_api_URL +
					"audio/" +
					this.audio_ID +
					"/" +
					this.status +
					"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						// title: this.title,
						// description: this.description,
						public: false,
						archived: true,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})
				.then((response) => {
					this.$store.commit("forceDashboardRerender");
				})
				.catch((error) => {
					console.error("Error:", error);
				});
		},

		savechanges() {
			fetch(
				process.env.VUE_APP_api_URL +
					"audio/" +
					this.audio_ID +
					"/" +
					this.status +
					"/",
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",

						Authorization: this.$store.state.idToken,
					},
					body: JSON.stringify({
						// url: "coverimage.jpg",
						title: this.title.normalize('NFC'),
						description: this.description.normalize('NFC'),
						public: this.publictf,
						// shared_with: [],
					}),
				}
			)
				.then((response) => {
					return response.json();
				})

				// .then((response) => {
				//   this.$store.commit("forceDashboardRerender");
				// })
				.catch((error) => {
					console.error("Error:", error);
				});
		},
	},
};
</script>

<style scoped>
.cardrow {
	width: 100%;
}
/* .editing {

  background: rgba(0, 0, 0, 0.5);
} */
.notediting {
	background: white;
}

/* .play {
  top: calc(50% - 1.75rem);
  right: 0;
} */
</style>