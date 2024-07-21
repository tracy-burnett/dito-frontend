<template>
	<div class="flex items-center justify-around pt-[4vh]">
		<span v-if="showResetPasswordModal" class="fixed inset-0 z-40 flex items-center justify-center w-full h-screen">
			<ResetPasswordModal @closeResetPasswordModal="closeResetPasswordModal()" />
		</span>
		<div class="flex flex-col items-center w-2/5 ">
			<p class="font-bold"
				:class="{ tibetanhuge: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetanhuge: $store.state.promptsObject.name != 'བོད་ཡིག' }">
				{{ $store.state.promptsObject.nLogin }}</p>
			<input class="w-full px-3 border border-gray-300 rounded mt-[2vh]" placeholder="Email"
				v-model="email_mixedcase" @keyup.enter="login(email, password)" />
			<input class="w-full px-3 border border-gray-300 rounded" placeholder="Password" type="password"
				v-model="password" @keyup.enter="login(email, password)" />
			<button
				class="w-full px-3 py-1 mt-[2vh]  font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700 hover:bg-cyan-600"
				@click="login(email, password)"
				:class="{ tibetan: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetan: $store.state.promptsObject.name != 'བོད་ཡིག' }">
				{{ $store.state.promptsObject.nLogin }}
			</button>

			<p class="text-xs mt-[3vh] underline cursor-pointer" @click="toggleResetPasswordModal">Forgot Password?</p>
		</div>
		<p>-or-</p>
		<div class="flex flex-col items-center w-2/5 ">
			<p class="text-xl font-bold">Register</p>

			<input class="w-full px-3 border border-gray-300 rounded mt-[2vh]" placeholder="Email"
				v-model="reg_email_mixedcase" @keyup.enter="
			register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
			" />
			<input class="w-full px-3 border border-gray-300 rounded" placeholder="Display Name"
				v-model="reg_display_name" maxlength="254" @keyup.enter="
			register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
			" />
			<input class="w-full px-3 border border-gray-300 rounded"
				placeholder="Password (must be at least six characters long)" type="password" v-model="reg_password"
				@keyup.enter="
			register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
			" />
			<input class="w-full px-3 border border-gray-300 rounded" placeholder="Verify Password" type="password"
				v-model="reg_password_verify" @keyup.enter="
			register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
			" />
			<div v-if="allowRegister == true" class="w-full">
				<button type="submit"
					class="w-full px-3 py-1 mt-[2vh] font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700 hover:bg-cyan-600"
					@click="
			register(reg_email, reg_password, reg_display_name, reg_description, reg_anonymous)
			">
					Register
				</button>
			</div>
			<div v-else
				class="w-full px-3 py-1 mt-[2vh] font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700">
				<p class="text-xs text-center sm:text-base">(passwords do not match; re-enter your password and try
					again)
				</p>
			</div>
		</div>
	</div>
</template>

<script>

import ResetPasswordModal from "@/components/ResetPasswordModal.vue";

export default {
	name: "Login",
	components: {
		ResetPasswordModal,
	},
	data() {
		return {
			email_mixedcase: "",
			password: "",
			reg_email_mixedcase: "",
			reg_password: "",
			reg_password_verify: "",
			reg_display_name: "",
			reg_description: "",
			reg_anonymous: false,
			showResetPasswordModal: false,
		};
	},

	computed: {
		allowRegister() {
			if (this.reg_password === this.reg_password_verify) {
				return true;
			} else {
				return false;
			}
		},
		email() {
			return this.email_mixedcase.toLowerCase().trim();
		},
		reg_email() {
			return this.reg_email_mixedcase.toLowerCase().trim();
		},
	},
	methods: {
		toggleResetPasswordModal() {
			this.showResetPasswordModal = !this.showResetPasswordModal;
		},
		closeResetPasswordModal() {
			this.showResetPasswordModal = false;
		},

		register: function (
			reg_email,
			reg_password,
			reg_display_name,
			reg_description,
			reg_anonymous
		) {
			if (this.allowRegister == true) {
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
			}
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
.nottibetan {
	font-size: 1rem
		/* 16px */
	;
	line-height: 1.5rem
		/* 24px */
	;
}

.tibetan {
	font-size: 1.5rem
		/* 14px */
	;
	line-height: 2rem
		/* 20px */
	;
}

.nottibetanhuge {
	font-size: 1.25rem
		/* 16px */
	;
	line-height: 1.75rem
		/* 24px */
	;
}

.tibetanhuge {
	font-size: 2.25rem
		/* 14px */
	;
	line-height: 2.5rem
		/* 20px */
	;
}
</style>