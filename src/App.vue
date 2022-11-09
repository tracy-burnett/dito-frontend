<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { auth } from "./firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

export default {
  created() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        this.$store.state.user = user;
        getIdToken(this.$store.state.user)
          .then((idToken) => {
            this.$store.commit("SetIdToken", idToken);
            // console.log(this.$store.state.idToken)
          })
          .catch((error) => {
            // An error happened.
            console.log("Oops. " + error.code + ": " + error.message);
          });
        console.log("you are currently signed in");
      } else {
        // User is signed out
        this.$store.commit("Logout_User")
        this.$store.commit("ClearIDToken")
        console.log("everybody signed out");
                  this.$router.push("/");
      }
    });
  },
};
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px; */
  /* overflow:hidden */
  font-family: "Myriad Pro", Myriad, "Liberation Sans", "Nimbus Sans L", "Helvetica Neue", Helvetica, Arial, sans-serif;
  /* overscroll-behavior-x: none; */
}
</style>
