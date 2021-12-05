import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sidebar: true
  },
  mutations: {
    toggleSidebar(state, visibility) {
      state.sidebar = visibility;
    }
  },
  actions: {
  },
  modules: {
  }
})
