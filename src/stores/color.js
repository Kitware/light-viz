/* eslint-disable no-unused-vars */
import { Mutations, Actions } from 'paraview-lite/src/stores/types';

export default {
  state: {},
  getters: {},
  mutations: {},
  actions: {
    COLOR_BY(
      { rootState, commit, dispatch },
      {
        colorMode,
        representationId,
        arrayLocation,
        arrayName,
        vectorMode,
        vectorComponent,
        rescale,
      }
    ) {
      console.log(
        'COLOR_BY',
        JSON.stringify(
          {
            colorMode,
            representationId,
            arrayLocation,
            arrayName,
            vectorMode,
            vectorComponent,
            rescale,
          },
          null,
          2
        )
      );
      const client = rootState.network.client;
      if (client) {
        client.remote.ColorManager.colorBy(
          representationId,
          colorMode || 'SOLID',
          arrayLocation || 'POINTS',
          arrayName || '',
          vectorMode || 'Magnitude',
          vectorComponent || 0,
          rescale || false
        )
          .then(() => {
            dispatch(Actions.PROXY_DATA_FETCH, {
              proxyId: representationId,
              needUI: false,
            });
          })
          .catch(console.error);
      }
    },
  },
};
