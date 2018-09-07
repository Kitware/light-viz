/* eslint-disable no-unused-vars */
// import { Mutations, Actions } from 'pvw-lightviz/src/stores/types';

export default {
  state: {
    view: '-1',
    stats: false,
    stillQuality: 100,
    interactiveQuality: 80,
    stillRatio: 1,
    interactiveRatio: 1,
    maxFPS: 30,
    mouseThrottle: 16.6,
  },
  getters: {
    VIEW_STATS(state) {
      return state.stats;
    },
    VIEW_ID(state) {
      return state.view;
    },
    VIEW_QUALITY_STILL(state) {
      return state.stillQuality;
    },
    VIEW_QUALITY_INTERACTIVE(state) {
      return state.interactiveQuality;
    },
    VIEW_RATIO_STILL(state) {
      return state.stillRatio;
    },
    VIEW_RATIO_INTERACTIVE(state) {
      return state.interactiveRatio;
    },
    VIEW_FPS_MAX(state) {
      return state.maxFPS;
    },
    VIEW_MOUSE_THROTTLE(state) {
      return state.mouseThrottle;
    },
  },
  mutations: {
    VIEW_ID_SET(state, id) {
      state.view = id;
    },
    VIEW_STATS_SET(state, enable) {
      state.stats = enable;
    },
    VIEW_QUALITY_STILL_SET(state, value) {
      state.stillQuality = value;
    },
    VIEW_QUALITY_INTERACTIVE_SET(state, value) {
      state.interactiveQuality = value;
    },
    VIEW_RATIO_STILL_SET(state, value) {
      state.stillRatio = value;
    },
    VIEW_RATIO_INTERACTIVE_SET(state, value) {
      state.interactiveRatio = value;
    },
    VIEW_FPS_MAX_SET(state, value) {
      state.maxFPS = value;
    },
    VIEW_MOUSE_THROTTLE_SET(state, value) {
      state.mouseThrottle = value;
    },
  },
  actions: {
    VIEW_RESET_CAMERA({ dispatch, rootState, state }, id) {
      const client = rootState.network.client;
      const viewId = id || state.view;
      if (client) {
        client.remote.ViewPort.resetCamera(viewId).catch(console.error);
      } else {
        console.error('no client', rootState);
      }
    },
    VIEW_ROLL_LEFT({ rootState, commit }, id) {
      console.log('roll left');
    },
    VIEW_ROLL_RIGHT({ rootState, commit }, id) {
      console.log('roll right');
    },
    VIEW_UPDATE_ORIENTATION({ rootState, commit }, { id, axis }) {
      console.log('orientation', id, axis);
    },
    // VIEW_UPDATE_ORIENTATION_AXIS_VISIBILITY({ state, dispatch }, visible) {
    //   const changeSet = [
    //     {
    //       id: state.view,
    //       name: 'OrientationAxesVisibility',
    //       value: visible ? 1 : 0,
    //     },
    //   ];
    //   dispatch(Actions.UPDATE_PROXY, changeSet);
    // },
    // UPDATE_BACKGROUND({ state, dispatch }, bgInfo) {
    //   const changeSet = [];
    //   const id = bgInfo.id || state.view;
    //   ['Background', 'Background2', 'UseGradientBackground'].forEach((name) => {
    //     if (bgInfo[name] !== undefined) {
    //       changeSet.push({
    //         id,
    //         name,
    //         value: bgInfo[name],
    //       });
    //     }
    //   });
    //   if (changeSet.length) {
    //     dispatch(Actions.UPDATE_PROXY, changeSet);
    //   }
    // },
    VIEW_RENDER({ rootState, state }, id) {
      console.log('RENDER');
      const client = rootState.network.client;
      const viewId = id || state.view;
      if (client) {
        console.log('trigger render');
        client.remote.VtkImageDelivery.stillRender({ view: viewId }).catch(
          console.error
        );
      } else {
        console.error('no client', rootState);
      }
    },
  },
};
