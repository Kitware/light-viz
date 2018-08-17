export default {
  state: {
    backgroundColor: '#000000',
    orientationAxis: true,
  },

  mutations: {
    // ------------------
    // External mutations
    // ------------------

    GLOBAL_BG(state, bg) {
      state.backgroundColor = bg;
    },
    GLOBAL_ORIENT_AXIS(state, flag) {
      state.orientationAxis = flag;
    },
  },
};
