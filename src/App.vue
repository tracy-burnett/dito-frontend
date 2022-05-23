<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  /* background: #f1f3f5; */
}
</style>

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
        this.$store.state.user = null;
        console.log("everybody signed out");
      }
    });
  },
};
</script>
