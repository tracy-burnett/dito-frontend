<template>

	<div class="sticky top-0 z-10 pb-2 bg-sky-600 bar">


		<div class="w-[20vh] absolute -ml-[7vh] -mt-[4vh]">
			<img src="@/assets/dito_logo_main_color.svg" />
		</div>

		<div class="flex-row items-center justify-between">

			<div class="flex flex-col items-center cursor-pointer">

				<div
					class="flex flex-col items-center w-10 h-10 pt-7"
					v-if="LoginLogoutButton"
					@click="signoutuser()"
				>
					<img
						src="@/assets/icon_sign_out.svg"
						class="pl-1"
					/>
					<div>
						<p>Logout</p>
					</div>

				</div>

				<div
					class="flex flex-col items-center w-10 h-10 pt-7"
					v-else
					@click="openlogin()"
				>
					<img src="@/assets/icon_profile.svg" />
					<p>Login</p>

				</div>

			</div>
		</div>
	</div>
</template>

<script>
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
	methods: {
		signoutuser: function () {
			this.$store.dispatch("Logout_User");
		},
		openlogin: function () {
			this.$router.replace("/");
			this.$store.commit("toggleInfobit", "Login");
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
.bar {
	min-width: 42rem;

	/* background-image:
     linear-gradient(to bottom,#111827,rgba(11,18,27, 0)); */
}
</style>