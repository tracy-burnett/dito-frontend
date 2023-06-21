<template>
	<div class="sticky top-0 z-30 flex flex-row h-0 bg-sky-600">

		<div class="w-[9.3vw] fixed -ml-[3.2vw] -mt-[1.9vw] flex">
			<img class="cursor-pointer" src="@/assets/dito_logo_main_color.svg" @click="gohome" />
		</div>

		<div class="flex dropdown">
			<button class="dropbtn  w-[8vw] border-sky-500 bg-sky-600 hover:bg-sky-500  ml-[7vw]">
				<div class="flex flex-row justify-around">
					<p class="flex text-sm font-medium">{{ $store.state.promptsObject["name"] }}&nbsp;</p>
					<div class="w-[1.5vw] flex">
						<img class="cursor-pointer" src="@/assets/icon_language.svg" />
					</div>
				</div>
			</button>
			<div class="text-sm dropdown-content">
				<a @click="selectLanguage('English')">English</a>
				<a @click="selectLanguage('中文')">中文</a>
				<!-- <a class="text-base" @click="selectLanguage('བོད་ཡིག')">བོད་ཡིག</a> -->
			</div>
		</div>


		<div class="fixed justify-center m-auto left-0 right-0 w-[70vw] flex">
			<slot></slot>
		</div>

		<div class="flex dropdown">
			<button @click="reloadapp"
				class="dropbtn  w-[12vw] border-sky-500 bg-sky-600 hover:bg-sky-500  fixed right-[7vw] ">

				<p class="text-sm font-medium ">{{ $store.state.promptsObject.nGetLatestAppVersion }}</p>

			</button>
		</div>

		<div class="fixed right-0 flex flex-col items-center">

			<div class="flex flex-col items-center cursor-pointer mr-[1vw]" v-if="LoginLogoutButton" @click="signoutuser()">
				<img src="@/assets/icon_sign_out.svg" class="pl-[.5vw] w-[3.2vw]  pt-[1vh]" />
				<div>
					<p class="text-sm">{{ $store.state.promptsObject.nLogout }}</p>
				</div>

			</div>

			<div class="flex flex-col items-center cursor-pointer mr-[1vw]" v-else @click="openlogin()">
				<img src="@/assets/icon_profile.svg" class="w-[3.2vw]  pt-[1vh]" />
				<p class="text-sm"
					:class="{ 'text-slate-700': $store.state.infobit != 'Login', 'text-slate-200': $store.state.infobit == 'Login' }">
					{{ $store.state.promptsObject.nLogin }}</p>

			</div>

		</div>
	</div>
</template>

<script>
import { useRoute } from 'vue-router';

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
	mounted() {
		this.route = useRoute();

		if (this.route.query.view) {
			let language = this.route.query.view.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
			if (language == "zh") { this.selectLanguage("中文") }
			else { this.selectLanguage("English") }
			// else if (language=="bo")
			// {this.selectLanguage("བོད་ཡིག")}
		} else {this.selectLanguage(this.$store.state.promptsObject.name)}
	},
	methods: {

		reloadapp() {
			location.reload()
		},

		selectLanguage(chosenlanguage) {


			fetch(process.env.VUE_APP_api_URL + "language/", {
				method: "POST",

				headers: {
					"Content-Type": "application/json",
					// Authorization: this.$store.state.idToken,
				},
				body: JSON.stringify({
					language: chosenlanguage
				}),
			})
				.then((response) => response.json()) // json to object
				.then((data) => {
					// console.log(data)
					this.$store.commit("changeLanguage", data['languageprompts'])

					// console.log("changing to " + chosenlanguage)


					if (this.$store.state.promptsObject.code != "en") {
						const url = new URL(location)

						if (this.route.name == "Storybook") {
							url.searchParams.delete("open")
							let openparam = ""
							for (let i = 0; i < this.$store.state.consoles.length; i++) {
								openparam = openparam + this.$store.state.consoles[i]
							}
							url.searchParams.set("view", this.$store.state.promptsObject.code)
							if (openparam.length > 0) { url.searchParams.set("open", openparam) }

						}
						else { url.searchParams.set("view", this.$store.state.promptsObject.code) }

						history.replaceState(history.state, '', url)
					}
					else {
						const url = new URL(location)
						url.searchParams.delete("view")

						history.replaceState(history.state, '', url)
					}



				})
				.catch((error) => console.error("Error:", error));

		},


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
.dropbtn {
	/* background-color: #7833ff; */
	border: none;
	color: white;
	padding: 1vh 1vh;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	/* margin: 4px 2px; */
	cursor: pointer;
	border-radius: 16px;
}

.dropdown {
	position: relative;
	display: inline-block;
}

.dropdown-content {
	display: none;
	position: absolute;
	right: 0;
	background-color: #f9f9f9;
	min-width: 160px;
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
	z-index: 1;
}

.dropdown-content a {
	color: black;
	padding: 12px 16px;
	text-decoration: none;
	display: block;
}



.dropdown-content a:hover {
	background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
	display: block;
}
</style>