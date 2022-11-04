<template>

	<div class="sticky top-0 z-30 pb-2 bg-sky-600">


		<div class="w-[20vh] absolute -ml-[7vh] -mt-[4vh]"  >
			<img class="cursor-pointer" src="@/assets/dito_logo_main_color.svg" @click="gohome"/>
		</div>

		<div class="absolute w-full text-sm"  >
			<p class="text-center text-slate-100 ">this website is in beta production; database backups are not guaranteed.  Download .srt files within "Viewer" mode of your interpretations to preserve valuable data.</p>
		</div>

		<div class="flex flex-row-reverse items-center justify-between">

			<div class="flex flex-col items-center">

				<div
					class="flex flex-col items-center w-10 h-10 cursor-pointer mr-[4vh] pt-[1vh]"
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
					class="flex flex-col items-center w-10 h-10 cursor-pointer mr-[4vh] pt-[1vh]"
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
			this.$router.replace("/");
		},
		openlogin: function () {
			this.$router.replace("/");
			this.$store.commit("toggleInfobit", "Login");
		},

		gohome: function() {
			this.$router.replace("/");
		}
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