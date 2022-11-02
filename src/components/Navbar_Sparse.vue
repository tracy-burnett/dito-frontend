<template>
	<div v-if="$store.state.sidebar">
		<div
			id="closesidebar"
			class="fixed z-40 w-full h-full"
			@click="closeSidebar()"
		></div>
		<SidebarAlt />
	</div>

	<div class="sticky top-0 z-10 flex flex-col items-center justify-between px-5 py-1 bg-sky-600 bar">

		<div class="flex items-center cursor-pointer">

			<div
				class="flex flex-col items-center w-10 h-10 pt-7"
				v-if="LoginLogoutButton" @click="signoutuser()"
			>
					<img
						src="@/assets/icon_sign_out.svg"
						class="pl-1"
					/>
					<div>
					<p>Logout</p></div>

			</div>
			<div
				class="flex flex-col items-center w-10 h-10 pt-7"
				v-else
						@click="openlogin()"
			>
					<img
						src="@/assets/icon_profile.svg"
					/>
					<p>Login</p>

			</div>

			<!-- <img
				src="@/assets/menu-outline.svg"
				class="w-8 ml-8 cursor-pointer"
				@click="showSidebar"
			/> -->
		</div>
	</div>
</template>

<script>
import SidebarAlt from "@/components/SidebarAlt.vue";

export default {
	name: "Navbar",
	props: {
		text: {
			default: "",
		},
	},
	data() {
		return {
			user: "",
		};
	},
	components: { SidebarAlt },
	methods: {
		showSidebar() {
			this.$store.commit("toggleSidebar", true);
		},

		closeSidebar() {
			this.$store.commit("toggleSidebar", false);
		},

		signoutuser: function () {
			this.$store.dispatch("Logout_User");
		},
		openlogin: function() {this.$store.commit("toggleInfobit", "Login")},
	},

	computed: {
		//We're not defining it here; we're using a computed property to reach out and get it.
		LoginLogoutButton: function () {
			return this.$store.state.user;
		},
	},
};
</script>

<style scoped>
.bar {
	min-width: 42rem;

	/* background-image:
     linear-gradient(to bottom,#111827,rgba(11,18,27, 0)); */
}
</style>