<template>
	<div class="sticky top-0 z-30 flex flex-row h-0 bg-sky-600">

		<div class="w-[130px] absolute -ml-[46px] -mt-[24px] flex ">
			<img class="cursor-pointer" src="@/assets/dito_logo_main_color.svg" @click="gohome" />
		</div>

		<div class="flex dropdown" v-if="$store.state.routeName == 'Storybook'">
			<button
				class="z-10 dropbtn right-[11px] mt-[18.2vh] xs:mt-0 xs:right-[50px] md:right-[550px] md-lg:right-[700px] lg:right-[820px] fixed  sm:ml-[100px]  w-20  md:w-[100px] border-sky-500 bg-sky-600 hover:bg-sky-500">
				<div class="flex flex-row justify-around">
					<p class="flex font-medium"
						:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetantiny: $store.state.promptsObject.name != 'བོད་ཡིག' }">
						{{ $store.state.promptsObject["name"] }}&nbsp;</p>
					<div class="w-[15px] flex">
						<img class="cursor-pointer" src="@/assets/icon_language.svg" />
					</div>
				</div>
			</button>
			<div
				class="right-[11px] mt-[24vh] xs:mt-[6vh] xs:right-[50px] md:right-[550px] md-lg:right-[700px] lg:right-[820px] fixed  sm:ml-[100px]  w-20  md:w-[100px] text-sm dropdown-content">
				<a @click="selectLanguage('English')">English</a>
				<a @click="selectLanguage('中文')">中文</a>
				<a class="text-lg" @click="selectLanguage('བོད་ཡིག')">བོད་ཡིག</a>
			</div>
		</div>
		<div v-else-if="$store.state.routeName == 'Home'" class="flex dropdown">

			<button
				class="z-10 dropbtn ml-[80px] mt-[4vh]  fixed  sm:ml-[100px] sm:mt-0 w-20   border-sky-500 bg-sky-600 hover:bg-sky-500">
				<div class="flex flex-row justify-around">
					<p class="flex font-medium"
						:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetantiny: $store.state.promptsObject.name != 'བོད་ཡིག' }">
						{{ $store.state.promptsObject["name"] }}&nbsp;</p>
					<div class="w-[15px] flex">
						<img class="cursor-pointer" src="@/assets/icon_language.svg" />
					</div>
				</div>
			</button>

			<div class="ml-[80px] mt-[10vh]  fixed  sm:ml-[100px] sm:mt-[5vh] w-20  text-sm dropdown-content ">
				<a @click="selectLanguage('English')">English</a>
				<a @click="selectLanguage('中文')">中文</a>
				<a class="text-lg" @click="selectLanguage('བོད་ཡིག')">བོད་ཡིག</a>
			</div>
		</div>


		<div class=" justify-center m-auto left-0 right-0 w-[70vw] flex mt-[.1vh]">
			<!-- <slot></slot> -->
			<p class="mt-1 text-sm font-semibold text-center text-slate-100">
				{{ $store.state.portalname }}</p>
			<p v-if="!LoginLogoutButton" class="mt-1 text-sm font-medium text-center text-slate-100">&nbsp;- public view
			</p>
			<p v-else class="mt-1 text-sm font-medium text-center text-slate-100">&nbsp;- user view
			</p>
		</div>

		<div class="flex dropdown">
			<button v-if="$store.state.routeName == 'Storybook'" @click="reloadapp"
				class="dropbtn   border-sky-500 bg-sky-600 hover:bg-sky-500   fixed mt-[76vh] xs:mt-[72px] right-[11px] w-[100px] md:w-[175px]  md:mt-0  md:right-[7vw] ">

				<p class="font-medium "
					:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetantiny: $store.state.promptsObject.name != 'བོད་ཡིག' }">
					{{ $store.state.promptsObject.nGetLatestAppVersion }}</p>

			</button>

			<button v-else-if="$store.state.routeName == 'Home'" @click="reloadapp"
				class="dropbtn   border-sky-500 bg-sky-600 hover:bg-sky-500  fixed mt-[4vh] right-[50px] w-[100px] sm:w-[175px]  sm:mt-0  sm:right-[7vw] ">

				<p class="font-medium "
					:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetantiny: $store.state.promptsObject.name != 'བོད་ཡིག' }">
					{{ $store.state.promptsObject.nGetLatestAppVersion }}</p>

			</button>
		</div>

		<div class="fixed right-0 flex flex-col items-center">

			<div class="flex flex-col items-center cursor-pointer mr-[1vw]" v-if="LoginLogoutButton"
				@click="signoutuser()">
				<img src="@/assets/icon_sign_out.svg" class="pl-[.5vw]  pt-[1vh]" />
				<div>
					<p class="text-slate-200"
						:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetantiny: $store.state.promptsObject.name != 'བོད་ཡིག' }">
						{{ $store.state.promptsObject.nLogout }}</p>
				</div>

			</div>

			<div class="flex flex-col items-center cursor-pointer mr-[1vw]" v-else @click="openlogin()">
				<img src="@/assets/icon_profile.svg" class="  pt-[1vh]" />
				<p
					:class="{ tibetantiny: $store.state.promptsObject.name == 'བོད་ཡིག', nottibetantiny: $store.state.promptsObject.name != 'བོད་ཡིག', 'text-slate-700': $store.state.infobit != 'Login', 'text-slate-200': $store.state.infobit == 'Login' }">
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
			else if (language == "bo") { this.selectLanguage("བོད་ཡིག") }
			else { this.selectLanguage("English") }
		} else { this.selectLanguage(this.$store.state.promptsObject.name) }
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
			if (this.LoginLogoutButton) {
				this.$store.commit('toggleInfobit', 'PublicCardList');
			}
			else {
				this.$store.commit('toggleInfobit', 'InfoRevitalize');
			}
			// this.$router.push("/");
			console.log(location.hostname)
			if (location.hostname == "localhost") { location.assign("http://localhost:8080/") }
			else {
				location.assign("https://" + location.hostname)
			}
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
	/* right: 0; */
	background-color: #f9f9f9;
	min-width: 160px;
	box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
	/* z-index: 50; */
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

.tibetantiny {
	font-size: 1.125rem
		/* 14px */
	;
	line-height: 1.75rem
		/* 20px */
	;
}



.nottibetantiny {
	font-size: 0.875rem
		/* 14px */
	;
	line-height: 1.25rem
		/* 20px */
	;
}
</style>