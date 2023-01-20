<template>
	<div class="flex-auto">
		<div class="flex flex-col">
			<Navbar />
			<Header />
			<div>
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

};
</script>
