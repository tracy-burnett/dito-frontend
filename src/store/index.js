import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // It's like data, but for your store.
    sidebar: true
  },
  getters: {
    // it's like computed properties, but for your store.
  },
  mutations: {
    //Can be tracked by Vue dev tools in (at least Chrome) browser.
    //Try to avoid using asynchronous code in here.  If you want to use one of these functions asynchronously, call it from actions.
    toggleSidebar(state, visibility) {
      state.sidebar = visibility;
    }
  },
  actions: {
    toggleSidebar: (context, visibility) => {
      context.commit('toggleSidebar', visibility)
    }
  },
  modules: {
  }
})
