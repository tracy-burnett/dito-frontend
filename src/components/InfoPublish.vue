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
	mounted() {},
	methods: {},
};
</script>

<style scoped>
.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 10px 20px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	margin: 4px 2px;
	cursor: pointer;
	border-radius: 16px;
}
</style>