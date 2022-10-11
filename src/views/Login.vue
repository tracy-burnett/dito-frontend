<template>
  <div class="flex-auto">
    <div class="flex-col flex-1 h-full overflow-hidden">
      <Navbar />
      <div class="flex items-center justify-center h-full mt-10">
        <div
          class="flex flex-col items-center p-8 bg-white border border-gray-300 shadow-md rounded-xl xl:w-1/5 lg:w-1/4 md:w-1/3"
        >
          <h1 class="text-2xl font-bold">Login</h1>
          <input
            class="w-full px-3 py-1 mt-12 mb-3 border border-gray-300 rounded"
            placeholder="Email"
            v-model="email"
            @keyup.enter="login(email, password)"
          />
          <input
            class="w-full px-3 py-1 border border-gray-300 rounded"
            placeholder="Password"
            type="password"
            v-model="password"
            @keyup.enter="login(email, password)"
          />
          <button
            class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700 hover:bg-cyan-600"

            @click="login(email, password)"
          >
            Login
          </button>
          <router-link to="/register"
            ><button
              class="w-full px-3 py-2 mt-16 text-sm font-medium text-white transition-colors border rounded border-cyan-600 bg-cyan-700 hover:bg-cyan-600"
            >
              Register
            </button></router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";

export default {
  name: "Login",
  components: {
    Navbar,
  },
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    login: function (email, password) {
      this.$store
        .dispatch("Login_User", { email, password })
        .then(() => {
          this.$router.replace("/");
        })
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