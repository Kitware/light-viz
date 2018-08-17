import { Actions } from 'pvw-lightviz/src/stores/types';

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
      proxyData() {
        return this.$store.getters.PROXY_DATA_MAP;
      },
      activeSource() {
        return this.$store.getters.PROXY_SELECTED_IDS[0];
      },
      activeView() {
        return this.$store.getters.VIEW_ID;
      },
      activeRepresentation() {
        return this.$store.getters.PROXY_SOURCE_TO_REPRESENTATION_MAP[
          this.$store.getters.PROXY_SELECTED_IDS[0]
        ];
      },
    },
    componentDefinition.computed
  );

  function refreshState() {
    // Create simple dependancy between method call and getters
    this.mtime = mtime++;

    const id = this[`active${proxyType}`];
    if (!id) {
      // console.log('No id available to update state');
      return;
    }

    const proxyData = this.proxyData ? this.proxyData[id] : null;
    if (!proxyData) {
      // console.log('no proxy data for id', id, this.proxyData);
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
    if (hasChange()) {
      // console.log('apply', JSON.stringify(changeSet, null, 2));
      store.dispatch(Actions.PROXY_UPDATE, changeSet);
      store.dispatch(Actions.PROXY_DATA_FETCH, {
        proxyId: this[`active${proxyType}`],
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
    data() {
      return Object.assign({ mtime: -1 }, componentDefinition.data.apply(this));
    },
    methods: Object.assign(
      {
        apply,
        hasChange,
        refreshState,
      },
      componentDefinition.methods
    ),
    watch: Object.assign(
      {
        proxyData: refreshState,
        [`active${proxyType}`]: refreshState,
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
