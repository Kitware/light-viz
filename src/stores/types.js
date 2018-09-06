function objEnum(names) {
  const obj = {};
  names.forEach((name) => {
    obj[name] = name;
  });
  return obj;
}

// ----------------------------------------------------------------------------
// Getters
// ----------------------------------------------------------------------------

export const Getters = objEnum([
  // index
  'APP_AUTO_APPLY',

  // modules
  'MODULES_LIST',
  'MODULES_ACTIVE',
  'MODULES_MAP',

  // network
  'NETWORK_CLIENT',
  'NETWORK_CONFIG',

  // proxy
  'PROXY_SELECTED_IDS',
  'PROXY_PIPELINE',
  'PROXY_TO_MODULE_MAP',
  'PROXY_SOURCE_TO_REPRESENTATION_MAP',
  'PROXY_DATA_MAP',
  'PROXY_NAME_MAP',

  // view
  'VIEW_ID',
]);

// ----------------------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------------------

export const Mutations = objEnum([
  // index
  'APP_ROUTE_SET',
  'APP_AUTO_APPLY_SET',

  // modules
  'MODULES_ADD',
  'MODULES_ACTIVE_SET',

  // network
  'NETWORK_CLIENT_SET',
  'NETWORK_CONFIG_SET',

  // proxy
  'PROXY_SELECTED_IDS_SET',
  'PROXY_PIPELINE_SET',
  'PROXY_MODULE_BIND',
  'PROXY_SOURCE_TO_REPRESENTATION_SET',
  'PROXY_DATA_SET',
  'PROXY_NAME_SET',

  // view
  'VIEW_ID_SET',
]);

// ----------------------------------------------------------------------------
// Actions
// ----------------------------------------------------------------------------

export const Actions = objEnum([
  // color
  'COLOR_BY',

  // index
  'APP_ROUTE_LANDING',
  'APP_ROUTE_RUN',

  // modules
  'MODULES_ACTIVE_CLEAR',
  'MODULES_ACTIVE_BY_NAME',

  // network
  'NETWORK_CONNECT',

  // proxy
  'PROXY_CREATE',
  'PROXY_UPDATE',
  'PROXY_DELETE',
  'PROXY_NAME_FETCH',
  'PROXY_PIPELINE_FETCH',
  'PROXY_DATA_FETCH',

  // view
  'VIEW_RESET_CAMERA',
  'VIEW_ROLL_LEFT',
  'VIEW_ROLL_RIGHT',
  'VIEW_UPDATE_ORIENTATION',
  'VIEW_RENDER',
]);

// ----------------------------------------------------------------------------

export default {
  Actions,
  Getters,
  Mutations,
};
