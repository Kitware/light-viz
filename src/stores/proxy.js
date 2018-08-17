/* eslint-disable no-unused-vars */
import { Mutations, Actions } from 'pvw-lightviz/src/stores/types';

export default {
  state: {
    selectedSources: [], // list of ids of the selected sources
    pipeline: [], // pipeline list
    proxyToModuleMap: {}, // xmlName(string) => moduleName(string)
    sourceToRepresentationMap: {}, // id(string) => id(string)
    proxyDataMap: {}, // id(string) => { data, properties, ui, id }
    proxyNames: {}, // id(string) => { group(str), name(str), label(str) }
  },
  getters: {
    PROXY_SELECTED_IDS(state) {
      return state.selectedSources;
    },
    PROXY_PIPELINE(state) {
      return state.pipeline;
    },
    PROXY_TO_MODULE_MAP(state) {
      return state.proxyToModuleMap;
    },
    PROXY_SOURCE_TO_REPRESENTATION_MAP(state) {
      return state.sourceToRepresentationMap;
    },
    PROXY_DATA_MAP(state) {
      return state.proxyDataMap;
    },
    PROXY_NAME_MAP(state) {
      return state.proxyNames;
    },
  },
  mutations: {
    PROXY_SELECTED_IDS_SET(state, idList) {
      state.selectedSources = idList.slice();
    },
    PROXY_PIPELINE_SET(state, sources) {
      state.pipeline = sources;
    },
    PROXY_MODULE_BIND(state, { name, module }) {
      state.proxyToModuleMap[name] = module;
    },
    PROXY_SOURCE_TO_REPRESENTATION_SET(state, { id, rep }) {
      state.sourceToRepresentationMap[id] = rep;
    },
    PROXY_DATA_SET(state, proxy) {
      if (proxy.id === '800') {
        console.log(JSON.stringify(proxy, null, 2));
      }
      const newValue = Object.assign({}, state.proxyDataMap[proxy.id], proxy);
      state.proxyDataMap = Object.assign({}, state.proxyDataMap, {
        [proxy.id]: newValue,
      });
    },
    PROXY_NAME_SET(state, proxyMeta) {
      state.proxyNames = Object.assign({}, state.proxyNames, {
        [proxyMeta.id]: proxyMeta,
      });
    },
  },
  actions: {
    PROXY_CREATE({ rootState, commit, dispatch }, { name, parentId }) {
      const client = rootState.network.client;
      if (client) {
        client.remote.ProxyManager.create(name, parentId)
          .then((proxy) => {
            commit(Mutations.PROXY_DATA_SET, proxy);
            commit(Mutations.PROXY_SELECTED_IDS_SET, [proxy.id]);
            dispatch(Actions.PROXY_PIPELINE_FETCH);
            dispatch(Actions.MODULES_ACTIVE_CLEAR);
          })
          .catch(console.error);
      }
    },
    PROXY_UPDATE({ rootState, state, dispatch }, changeset) {
      const client = rootState.network.client;
      if (client) {
        // const idToUpdate = new Set(changeset.map((i) => i.id));
        client.remote.ProxyManager.update(changeset)
          .then((result) => {
            // idToUpdate.forEach((id) => {
            //   dispatch(Actions.PROXY_DATA_FETCH, id, false);
            // });
            dispatch(Actions.PROXY_PIPELINE_FETCH);
          })
          .catch(console.error);
      }
    },
    PROXY_DELETE({ dispatch, rootState }, id) {
      const client = rootState.network.client;
      if (client) {
        client.remote.ProxyManager.delete(id)
          .then(({ sources, view }) => {
            dispatch(Actions.PROXY_PIPELINE_FETCH);
          })
          .catch(console.error);
      }
    },
    PROXY_NAME_FETCH({ rootState, commit }, id) {
      const client = rootState.network.client;
      if (client) {
        client.remote.ProxyName.getProxyName(id)
          .then((info) => {
            commit(Mutations.PROXY_NAME_SET, info);
          })
          .catch(console.error);
      }
    },
    PROXY_PIPELINE_FETCH({ rootState, state, commit, dispatch }) {
      const client = rootState.network.client;
      if (client) {
        client.remote.ProxyManager.list()
          .then(({ sources, view }) => {
            commit(Mutations.PROXY_PIPELINE_SET, sources);
            commit(Mutations.VIEW_ID_SET, view);

            // Fetch view data if first time
            if (!state.proxyDataMap[view]) {
              dispatch(Actions.PROXY_DATA_FETCH, { proxyId: view });
            }

            // Update source -> rep mapping
            sources.forEach((proxy) => {
              commit(Mutations.PROXY_SOURCE_TO_REPRESENTATION_SET, proxy);

              // Fetch proxy data if not available
              if (!state.proxyDataMap[proxy.id]) {
                dispatch(Actions.PROXY_DATA_FETCH, { proxyId: proxy.id });
              }

              // Fetch proxy name if not available
              if (!state.proxyNames[proxy.id]) {
                dispatch(Actions.PROXY_NAME_FETCH, proxy.id);
              }

              // Fetch representation data if not available
              if (!state.proxyDataMap[proxy.rep]) {
                dispatch(Actions.PROXY_DATA_FETCH, { proxyId: proxy.rep });
              }

              // Fetch representation name if not available
              if (!state.proxyNames[proxy.rep]) {
                dispatch(Actions.PROXY_NAME_FETCH, proxy.rep);
              }
            });
          })
          .catch(console.error);
      }
    },
    PROXY_DATA_FETCH({ rootState, commit, state }, { proxyId, needUI = true }) {
      console.log('fetch', proxyId, needUI);
      const client = rootState.network.client;
      if (client) {
        // FIXME server side does not like needUI=false
        client.remote.ProxyManager.get(proxyId, needUI || true)
          .then((proxy) => {
            commit(Mutations.PROXY_DATA_SET, proxy);
          })
          .catch(console.error);
      }
    },
  },
};
