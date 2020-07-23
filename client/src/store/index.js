import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const types = {
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_USER: 'SET_USER',
  SET_CAPITALLISTACTION: 'SET_CAPITALLISTACTION',
  SET_TIMEFILTER: 'SET_TIMEFILTER'
}

const state = {
  isAuthenticated: false,
  user: {},
  capitalListAction: 'obtain',
  timeFilter: {
    startTime: "",
    endTime: "",
    search: false
  }
};
const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  capitalListAction: state => state.capitalListAction,
  timeFilter: state => state.timeFilter
};
const mutations = {
  [types.SET_AUTHENTICATED](state, isAuthenticated) {
    if (isAuthenticated) state.isAuthenticated = isAuthenticated;
    else state.isAuthenticated = false;
  },
  [types.SET_USER](state, user) {
    if (user) state.user = user;
    else state.user = {};
  },
  [types.SET_CAPITALLISTACTION](state, action) {
    if (state.capitalListAction) {
      state.capitalListAction = action;
    } else {
      state.capitalListAction = 'obtain'; //不传参就复原
    }
  },
  [types.SET_TIMEFILTER](state, timeFilter) {
    if (timeFilter) {
      state.timeFilter = timeFilter;
    } else {
      state.timeFilter = {
        startTime: "",
        endTime: "",
        search: false
      }
    }
  }
};
const actions = {
  setAuthenticated({ commit }, isAuthenticated) {
    commit(types.SET_AUTHENTICATED, isAuthenticated);
  },
  setUser({ commit }, user) {
    commit(types.SET_USER, user);
  },
  clearCurrentState({ commit }) {
    commit(types.SET_AUTHENTICATED, false);
    commit(types.SET_USER, null);
  },
  setCapitalListAction({ commit }, action) {
    commit(types.SET_CAPITALLISTACTION, action);
  },
  setTimeFilter({ commit }, timeFilter) {
    commit(types.SET_TIMEFILTER, timeFilter);
  }
};
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})
