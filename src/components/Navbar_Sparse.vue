<template>

	<div class="sticky top-0 z-30 h-0 bg-sky-600">

		<div class="w-[9.3vw] fixed -ml-[3.2vw] -mt-[1.9vw]">
			<img
				class="cursor-pointer"
				src="@/assets/dito_logo_main_color.svg"
				@click="gohome"
			/>
		</div>

		<div class="fixed m-auto left-0 right-0 w-[70vw]">
			<slot></slot>
		</div>

		<div class="fixed right-0 flex flex-col items-center">

			<div
				class="flex flex-col items-center cursor-pointer mr-[1vw]"
				v-if="LoginLogoutButton"
				@click="signoutuser()"
			>
				<img
					src="@/assets/icon_sign_out.svg"
					class="pl-[.5vw] w-[3.2vw]  pt-[1vh]"
				/>
				<div>
					<p class="text-sm">Logout</p>
				</div>

			</div>

			<div
				class="flex flex-col items-center cursor-pointer mr-[1vw]"
				v-else
				@click="openlogin()"
			>
				<img
					src="@/assets/icon_profile.svg"
					class="w-[3.2vw]  pt-[1vh]"
				/>
				<p class="text-sm">Login</p>

			</div>

		</div>
	</div>
</template>

<script>
export default {
	name: "Navbar",
	props: {
		// text: {
		// 	default: "",
		// },
	},
	data() {
		return {
			user: "",
		};
	},
	methods: {
		

		signoutuser: function () {
			this.$store.dispatch("Logout_User");
			this.$router.replace("/");
		},
		openlogin: function () {
			this.$router.replace("/");
			this.$store.commit("toggleInfobit", "Login");
		},

		gohome: function () {
			
			this.$store.commit('toggleInfobit', 'InfoRevitalize');
			this.$router.push("/");
		},
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
</style>