<template>

	<div class="flex items-center justify-around pt-[4vh]">
		<div class="flex flex-col items-center w-2/5 ">
			<p class="text-xl font-bold">Login</p>
			<input
				class="w-full px-3 border border-gray-300 rounded mt-[2vh]"
				placeholder="Email"
				v-model="email"
				@keyup.enter="login(email, password)"
			/>
			<input
				class="w-full px-3 border border-gray-300 rounded"
				placeholder="Password"
				type="password"
				v-model="password"
				@keyup.enter="login(email, password)"
			/>
			<button
				class="w-full px-3 py-1 mt-[2vh]  font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700 hover:bg-cyan-600"
				@click="login(email, password)"
			>
				Login
			</button>

			<p class="text-xs mt-[3vh]">(Forgot Password feature not available yet)</p>
		</div>
		<p>-or-</p>
		<div class="flex flex-col items-center w-2/5 ">
			<p class="text-xl font-bold">Register</p>

			<input
				class="w-full px-3 border border-gray-300 rounded mt-[2vh]"
				placeholder="Email"
				v-model="reg_email"
				@keyup.enter="
    register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
  "
			/>
			<!-- <input
  class="w-full px-3 py-1 border border-gray-300 rounded"
  placeholder="Blurb"
  v-model="reg_description"
  @keyup.enter="
    register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
  "
/> -->
			<input
				class="w-full px-3 border border-gray-300 rounded"
				placeholder="Display Name"
				v-model="reg_display_name"
				maxlength="254"
				@keyup.enter="
    register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
  "
			/>
			<input
				class="w-full px-3 border border-gray-300 rounded"
				placeholder="Password"
				type="password"
				v-model="reg_password"
				@keyup.enter="
    register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
  "
			/>
			<button
				type="submit"
				class="w-full px-3 py-1 mt-[2vh] font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700 hover:bg-cyan-600"
				@click="
    register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
  "
			>
				Register
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "Login",
	components: {},
	data() {
		return {
			email: "",
			password: "",
			reg_email: "",
			reg_password: "",
			reg_display_name: "",
			reg_description: "",
			reg_anonymous: false,
		};
	},
	methods: {
		register: function (
			reg_email,
			reg_password,
			reg_display_name,
			reg_description,
			reg_anonymous
		) {
			let newinfobit = this.$store.state.infobitToBe;
			this.$store
				.dispatch("Register_User", {
					reg_email,
					reg_password,
					reg_display_name,
					reg_description,
					reg_anonymous,
					newinfobit,
				})
				.catch((error) => {
					// An error happened.
					console.log("Oops. " + error.code + ": " + error.message);
				});
		},
		login: function (email, password) {
			this.$store
				.dispatch("Login_User", { email, password })

				.catch((error) => {
					// An error happened.
					console.log("Oops. " + error.code + ": " + error.message);
				});
		},
	},
};
</script>

<style scoped>
</style>