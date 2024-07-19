<template>
	<div class="flex-auto">
		<div class="flex flex-col">
			<Navbar>
				<!-- <p class="mt-1 text-sm font-semibold text-center cursor-pointer text-slate-100">
					{{ $store.state.portalname }}
				</p> -->
			</Navbar>
			<Header></Header>
			<div v-if="!LoginLogoutButton">
				<div v-if="$store.state.infobit=='Login'"><Login /></div>
				<div v-else><InfoRevitalize /></div>
			</div>
			<div v-else>
				<component v-bind:is="$store.state.infobit"></component>
			</div>
		</div>
	</div>
</template>

<script>
import Navbar from "@/components/Navbar_Sparse.vue";
import Header from "@/components/Header.vue";
import PublicCardList from "@/components/PublicCardList.vue";
import CreateStorybook from "@/views/CreateStorybook_Sparse.vue";
import InfoPublish from "@/components/InfoPublish.vue";
import InfoRevitalize from "@/components/InfoRevitalize.vue";
import Login from "@/views/LoginOrRegister.vue";

export default {
	name: "Home",
	components: {
		Navbar,
		Header,
		PublicCardList,
		CreateStorybook,
		InfoPublish,
		InfoRevitalize,
		Login,
	},
	computed: {
		//We're not defining it here; we're using a computed property to reach out and get it.
		LoginLogoutButton: function () {
			return this.$store.state.user;
		},
	},

	mounted() {
		
		this.$store.commit("updateRouteName", "Home")
	},
	// mounted() {

	// 	if (this.$store.state.promptsObject.code != "en") {
	// 		const url = new URL(location)
	// 		url.searchParams.set("view", this.$store.state.promptsObject.code)
	// 		history.replaceState(history.state, '', url)
	// 	}
	// 	else {
	// 		const url = new URL(location)
	// 		console.log("TWO")
	// 		url.searchParams.delete("view")
	// 		history.replaceState(history.state, '', url)
	// 	}
	// },

};
</script>
