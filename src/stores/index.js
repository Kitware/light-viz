// import Vue from 'vue';
import Vuex from 'vuex';

import busy from 'pvw-lightviz/src/stores/busy';
import color from 'pvw-lightviz/src/stores/color';
import modules from 'pvw-lightviz/src/stores/modules';
import network from 'pvw-lightviz/src/stores/network';
import proxy from 'pvw-lightviz/src/stores/proxy';
import view from 'pvw-lightviz/src/stores/view';

import { Mutations } from 'pvw-lightviz/src/stores/types';

// http://jsperf.com/typeofvar
// function typeOf(o) {
//   return {}.toString
//     .call(o)
//     .slice(8, -1)
//     .toLowerCase();
// }

// quick object merge using Vue.set
/* eslint-disable no-param-reassign */
// function merge(dst, src) {
//   const keys = Object.keys(src);
//   for (let i = 0; i < keys.length; ++i) {
//     const key = keys[i];
//     if (typeOf(dst[key]) === 'object' && typeOf(src[key]) === 'object') {
//       Vue.set(dst, key, merge(dst[key], src[key]));
//     } else {
//       Vue.set(dst, key, src[key]);
//     }
//   }
//   return dst;
// }
/* eslint-enable no-param-reassign */

function createStore() {
  return new Vuex.Store({
    state: {
      route: 'landing', // valid values: landing, app
      autoApply: true,
    },
    modules: {
      busy,
      color,
      modules,
      network,
      proxy,
      view,
    },
    getters: {
      APP_AUTO_APPLY(state) {
        return state.autoApply;
      },
    },
    mutations: {
      APP_ROUTE_SET(state, route) {
        state.route = route;
      },
      APP_AUTO_APPLY_SET(state, auto) {
        state.autoApply = auto;
      },
    },
    actions: {
      APP_ROUTE_LANDING({ commit }) {
        commit(Mutations.APP_ROUTE_SET, 'landing');
      },
      APP_ROUTE_RUN({ commit }) {
        commit(Mutations.APP_ROUTE_SET, 'app');
      },
    },
  });
}

export default createStore;
