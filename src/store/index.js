import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, } from "firebase/auth";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // It's like data, but for your store.
    user: null,
    sidebar: true,
    // nextnextTimestamp: 0, // just for dev, can comment out in production
    // nextTimestamp: 0,
    // audioDuration: 0,
    styleoption: "Viewer",
    currentTime: "00:00:00",
    // playFromTimestamp: 0,
    audioplayertime: 0,
    triggerTimestamps: [],
    idToken: null,

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

    updateCurrentTime(state, value) {
      state.currentTime = value
    },

    updateAudioTime(state, audiotime) {
      state.audioplayertime = audiotime;
    },

    // updatePlayFromTimestamp(state, timestamp) {
    //   state.playFromTimestamp = timestamp;
    // },

    addTriggerTimestamp(state, nextTriggerTimestamp) {
      state.triggerTimestamps.push(nextTriggerTimestamp)
    },
    
    clearTriggerTimestamp(state) {
      state.triggerTimestamps.length=0
    },

    orderTriggerTimestamp(state) {
      state.triggerTimestamps.sort((a,b) => a-b)
      state.triggerTimestamps = [...new Set(state.triggerTimestamps)]
    },

    // updateNextTimestamp(state, nextTimestamp) {
    //   state.nextTimestamp = nextTimestamp
    // },

    // setAudioDuration(state, duration) {
    //   state.audioDuration = duration
    // },

    // updateNextNextTimestamp(state, nextnextTimestamp) { // just for dev, can comment out in production
    //   state.nextnextTimestamp = nextnextTimestamp
    // },

    toggleStorybookStyle(state, styleselection) {
      state.styleoption = styleselection;
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
          // console.log(data)
          context.commit('Login_User', data.user)
          // console.log(context.state.user)
          // getIdToken(context.state.user)
          //   .then((idToken) => {
          //     // context.commit('SetIdToken', idToken)
          //     // console.log(context.state.idToken)
          //   })
          //   .catch((error) => {
          //     // An error happened.
          //     console.log("Oops. " + error.code + ": " + error.message);
          //   })
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
          // console.log(data)
          context.commit('Login_User', data.user)
          // console.log(context.state.user)
          // getIdToken(context.state.user)
          //   .then((idToken) => {
          //     context.commit('SetIdToken', idToken)
          //     // console.log(context.state.idToken)
          //   })
          //   .catch((error) => {
          //     // An error happened.
          //     console.log("Oops. " + error.code + ": " + error.message);
          //   })
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log("Oops. " + error.code + ": " + error.message);
        });



    },

    // clearTriggerTimestamp: (context) => {
    //   context.commit('clearTriggerTimestamp')
    //   console.log('store 1')
    //   console.log(context.triggerTimestamps)
    //   console.log('store 2')
    // },

    toggleStorybookStyle: (context, styleselection) => {
      context.commit('toggleStorybookStyle', styleselection)
    }, // oops this is not necessary, please directly call synchronous mutation instead of this.

  },
  modules: {
  }
})
