<template>
	<div>
		<div class="flex items-center mt-[7vh]">
			<CardList :key="$store.state.dashboardRerender" />
		</div>
	</div>
</template>

<script>
import CardList from "@/components/CardList.vue";

export default {
	data() {
		return {};
	},

	components: {
		CardList,
	},
	name: "InfoPublish",
	computed: {
		// usernameStorybooks() {
		// 		return this.$store.state.user.email + "'s Storybooks";
		// },
	},
	props: {},
	// watch: {
	//   "$store.state.idToken": function () {
	//     this.getStorybooks();
	//   },

	// },
	mounted() { },
	methods: {},
};
</script>

<style scoped></style>