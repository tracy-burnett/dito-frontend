import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // It's like data, but for your store.
    user: null,
    sidebar: true,
  },
  getters: {
    // it's like computed properties, but for your store.
  },
  mutations: {
    //Can be tracked by Vue dev tools in (at least Chrome) browser.
    //Try to avoid using asynchronous code in here.  If you want to use one of these functions asynchronously, call it from actions.

    Login_User(state, { email, password }) {
      const email2 = email
      const password2 = password
      signInWithEmailAndPassword(auth, email2, password2)
        .then((userCredential) => {
          // onAuthStateChanged listener will handle user assignment
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Oops. " + error.code + ": " + error.message);
        });


    },

    Logout_User(state) {
      signOut(auth)
        .then(() => {
          // onAuthStateChanged listener will handle user assignment
        })
        .catch((error) => {
          // An error happened.
          console.log("Oops. " + error.code + ": " + error.message);
        });
    },

    Register_User(state, { email, password }) {
      const register_email = email
      const register_password = password
      createUserWithEmailAndPassword(auth, register_email, register_password)
        .then((userCredential) => {
          // onAuthStateChanged listener will handle user assignment
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Oops. " + error.code + ": " + error.message);
        });


    },


    toggleSidebar(state, visibility) {
      state.sidebar = visibility;
    },

  },
  actions: {
    
    Logout_User: (context) => {
      context.commit('Logout_User')
    },

    Login_User: (context, { email, password }) => {
      context.commit('Login_User', { email, password })
    },

    Register_User: (context, { email, password }) => {
      context.commit('Register_User', { email, password })
    },

    toggleSidebar: (context, visibility) => {
      context.commit('toggleSidebar', visibility)
    },

  },
  modules: {
  }
})
