import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, } from "firebase/auth";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // It's like data, but for your store.
    user: null, // currently logged-in user
    sidebar: true, // sidebar displayed or not
    consoles: [], // array of ID's of interpretations for which there should be a viewer column currently displayed in the browser
    incomingCurrentTime: 0, // Viewer.vue can update this, and when it is updated, Player will start playing audio from this time
    audioplayertime: 0, // the current time of the audio player
    idToken: null, // the idToken of the currently logged-in user

  },
  getters: {
    // it's like computed properties, but for your store.
  },
  mutations: {
    //Can be tracked by Vue dev tools in (at least Chrome) browser.
    //Try to avoid using asynchronous code in here.  If you want to use one of these functions asynchronously, call it from actions.



    Logout_User(state) {
      state.user = null
    },

    Login_User(state, user) {

      state.user = user
    },

    SetIdToken(state, token) {
      state.idToken = token
    },

    toggleSidebar(state, visibility) {
      state.sidebar = visibility;
    },

    updateIncomingCurrentTime(state, value) {
      state.incomingCurrentTime = value
    },

    updateAudioTime(state, audiotime) {
      state.audioplayertime = audiotime;
    },

    addConsolesCount(state, interpretation_id) {
      state.consoles.push(interpretation_id)
    },

    deleteConsole(state, interpretation_id) {
      let index = state.consoles.indexOf(interpretation_id);

      if (index > -1) {
        state.consoles.splice(index, 1); // 2nd parameter means remove one item only
      }
    },
  },
  actions: {


    Login_User: (context, { email, password }) => {
      const email2 = email
      const password2 = password
      return signInWithEmailAndPassword(auth, email2, password2)
        .then((userCredential) => { return userCredential })
        .then((data) => {
          // onAuthStateChanged listener will handle user assignment
          context.commit('Login_User', data.user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Oops. " + error.code + ": " + error.message);
        });




    },

    Logout_User: (context) => {

      signOut(auth)
        .then(() => {
          // onAuthStateChanged listener will handle user assignment
          context.commit('Logout_User')
        })
        .catch((error) => {
          // An error happened.
          console.log("Oops. " + error.code + ": " + error.message);
        });


    },

    Register_User: (context, { email, password }) => {
      const register_email = email
      const register_password = password
      return createUserWithEmailAndPassword(auth, register_email, register_password)
        .then((userCredential) => { return userCredential })
        .then((data) => {
          // onAuthStateChanged listener will handle user assignment
          context.commit('Login_User', data.user)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Oops. " + error.code + ": " + error.message);
        });



    },

  },
  modules: {
  }
})
