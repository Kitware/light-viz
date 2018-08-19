import { Actions, Mutations } from 'pvw-lightviz/src/stores/types';

/* eslint-disable no-param-reassign */
function extractProperties(names, properties, result) {
  for (let i = 0; i < properties.length; i++) {
    if (names.indexOf(properties[i].name) !== -1) {
      result[properties[i].name] = Object.assign({}, properties[i]);
    }
    if (properties[i].children) {
      extractProperties(names, properties[i].children, result);
    }
  }
}

function copyMap(src, dest) {
  Object.keys(src).forEach((key) => {
    dest[key] = Object.assign({}, src[key]);
  });
}
/* eslint-enable no-param-reassign */

function defaultConvert(value) {
  if (Array.isArray(value)) {
    return value.slice();
  }
  return value;
}

function isDifferent(a, b) {
  if (a !== b) {
    if (Array.isArray(a)) {
      for (let i = 0; i < a.length; i++) {
        if (isDifferent(a[i], b[i])) {
          return true;
        }
      }
      return false;
    }
    return true;
  }
  // They are the same
  return false;
}

export function toBoolean(value) {
  return !!value;
}

export function bool2int(value) {
  return value ? 1 : 0;
}

// Expected structure
//
// {
//   [propNameForVue]: {
//     name: 'Background', // Server side property
//     autoApply: true/false
//     clientToServer(value) {},
//     serverToClient(value) {},
//   }
// }
//
// >>>>>
//
// {
//   computed: { [...] },
//   methods: {
//     apply(),
//     hasChange(),
//   },
//   created,
// }
export function generateComponentWithServerBinding(
  proxyNameToCreate, // Provide null if not expected to create new proxy
  proxyType,
  propMaps,
  componentDefinition
) {
  let store = null;
  let mtime = 0;
  const serverPropNames = Object.keys(propMaps).map((i) => propMaps[i].name);
  const serverState = {};
  const localState = {};
  const changeSet = [];
  const computed = Object.assign(
    {
      activeSourceId() {
        return this.$store.getters.PROXY_SELECTED_IDS[0];
      },
      activeViewId() {
        return this.$store.getters.VIEW_ID;
      },
      activeRepresentationId() {
        return this.$store.getters.PROXY_SOURCE_TO_REPRESENTATION_MAP[
          this.$store.getters.PROXY_SELECTED_IDS[0]
        ];
      },
      activeProxyData() {
        const id = this[`active${proxyType}Id`];
        if (!id) {
          // console.log('No id available to update state');
          return null;
        }

        const proxyData = this.$store.getters.PROXY_DATA_MAP;
        if (!proxyData) {
          // console.log('no proxy data for id', id, this.proxyData);
          return null;
        }
        return proxyData[id];
      },
    },
    componentDefinition.computed
  );

  function refreshState() {
    // Create simple dependancy between method call and getters
    this.mtime = mtime++;

    const proxyData = this.activeProxyData;
    if (!proxyData) {
      return;
    }

    if (this.create) {
      // Reset props to default
      Object.keys(propMaps).forEach((key) => {
        serverState[propMaps[key].name] = {
          id: '0',
          value: propMaps[key].default,
          subProxy: propMaps[key].subProxy,
          label: propMaps[key].label || propMaps[key].name,
        };
        copyMap(serverState, localState);
      });
      return;
    }
    // console.log(proxyData.properties);

    extractProperties(serverPropNames, proxyData.properties, serverState);
    copyMap(serverState, localState);
    // console.log('refreshState', JSON.stringify(localState, null, 2));
  }

  function hasChange() {
    changeSet.length = 0;
    for (let i = 0; i < serverPropNames.length; i++) {
      const key = serverPropNames[i];
      if (
        localState[key] &&
        serverState[key] &&
        isDifferent(localState[key].value, serverState[key].value)
      ) {
        console.log('hasChange', key, localState[key], serverState[key]);
        changeSet.push(localState[key]);
      }
    }
    console.log('=>', changeSet.length);
    return changeSet.length;
  }

  function apply() {
    if (hasChange() && !this.create) {
      // console.log('apply', JSON.stringify(changeSet, null, 2));
      store.dispatch(Actions.PROXY_UPDATE, changeSet);
      store.dispatch(Actions.PROXY_DATA_FETCH, {
        proxyId: this[`active${proxyType}Id`],
        needUI: false,
      });
    }
  }

  // Fill computed fields
  Object.keys(propMaps).forEach((key) => {
    const propName = propMaps[key].name;
    const autoApply = propMaps[key].autoApply || false;
    const getFn = propMaps[key].serverToClient || defaultConvert;
    const setFn = propMaps[key].clientToServer || defaultConvert;
    computed[key] = {
      get() {
        // register dependency
        this.mtime; // eslint-disable-line
        return localState[propName]
          ? getFn(localState[propName].value)
          : propMaps[key].default;
      },
      set(value) {
        localState[propName].value = setFn(value);
        if (autoApply) {
          apply.apply(this);
        }
      },
    };
  });

  return Object.assign({}, componentDefinition, {
    computed,
    props: Object.assign(
      proxyNameToCreate
        ? {
            create: {
              type: Boolean,
              default: false,
            },
          }
        : {},
      componentDefinition.props
    ),
    data() {
      return Object.assign({ mtime: -1 }, componentDefinition.data.apply(this));
    },
    methods: Object.assign(
      {
        apply,
        hasChange,
        refreshState,
      },
      proxyNameToCreate
        ? {
            deleteProxy() {
              console.log('deleteProxy', this.create, this.activeSourceId);
              if (!this.create) {
                this.$store.dispatch(Actions.PROXY_DELETE, this.activeSourceId);
                this.$store.commit(Mutations.PROXY_SELECTED_IDS_SET, []);
              } else {
                this.$store.dispatch(Actions.MODULES_ACTIVE_CLEAR);
              }
            },
            createProxy() {
              const initialValues = {};
              if (hasChange()) {
                Object.keys(localState).forEach((key) => {
                  if (!localState[key].subProxy) {
                    initialValues[localState[key].label] =
                      localState[key].value;
                  }
                  // FIXME create a post create changeSet
                });
              }
              console.log('initialValues', initialValues);

              this.$store.dispatch(Actions.PROXY_CREATE, {
                name: proxyNameToCreate,
                parentId: this.activeSourceId,
                initialValues,
                skipDomain: !!hasChange(),
              });
            },
          }
        : null,
      componentDefinition.methods
    ),
    watch: Object.assign(
      {
        activeProxyData: refreshState,
      },
      componentDefinition.watch
    ),
    created() {
      // Capture store inside closure
      store = this.$store;

      if (componentDefinition.created) {
        componentDefinition.created.apply(this);
      }
    },
    mounted() {
      this.refreshState();
      if (componentDefinition.mounted) {
        componentDefinition.mounted.apply(this);
      }
    },
  });
}
