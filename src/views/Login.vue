<template>
  <div class="flex-auto">
    <div class="flex-1 flex-col h-full overflow-hidden">
      <Navbar />
      <div class="flex justify-center items-center h-full mt-10">
        <div
          class="
            flex flex-col
            items-center
            border border-gray-300
            bg-white
            shadow-md
            rounded-xl
            p-8
            xl:w-1/5
            lg:w-1/4
            md:w-1/3
          "
        >
          <h1 class="text-2xl font-bold">Login</h1>
          <input
            class="border border-gray-300 rounded w-full mt-12 mb-3 px-3 py-1"
            placeholder="Email"
            v-model="email"
            @keyup.enter="login(email, password)"
          />
          <input
            class="border border-gray-300 rounded w-full px-3 py-1"
            placeholder="Password"
            type="password"
            v-model="password"
            @keyup.enter="login(email, password)"
          />
          <button
            class="
              bg-indigo-500
              border border-indigo-400
              w-full
              text-sm
              px-3
              py-2
              mt-16
              rounded
              font-medium
              text-white
              hover:bg-indigo-400
              transition-colors
            "
            @click="login(email, password)"
          >
            Login
          </button>
          <router-link to="/register"
            ><button
              class="
                bg-indigo-500
                border border-indigo-400
                w-full
                text-sm
                px-3
                py-2
                mt-16
                rounded
                font-medium
                text-white
                hover:bg-indigo-400
                transition-colors
              "
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