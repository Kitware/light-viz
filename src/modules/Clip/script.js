import { mapActions } from 'vuex';
import { Actions, Mutations } from 'pvw-lightviz/src/stores/types';

import {
  generateComponentWithServerBinding,
  bool2int,
  toBoolean,
} from 'pvw-lightviz/src/proxyHelper';

import module from './module';

export default generateComponentWithServerBinding(
  'Source',
  {
    crinkleclip: {
      name: 'PreserveInputCells',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: true,
    },
    invert: {
      name: 'Invert',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: true,
    },
    origin: { name: 'Origin', autoApply: true, default: [0, 0, 0] },
    normal: { name: 'Normal', autoApply: true, default: [0, 0, 1] },
  },
  {
    name: 'Clip',
    props: {
      create: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        module,
        color: 'grey darken-2',
        normalMode: 3,
        domains: {
          xOrigin: {
            min: -5,
            max: 5,
            step: 1,
          },
          yOrigin: {
            min: -5,
            max: 5,
            step: 1,
          },
          zOrigin: {
            min: -5,
            max: 5,
            step: 1,
          },
        },
      };
    },
    computed: {
      xNormal: {
        get() {
          return this.normal[0];
        },
        set(value) {
          const newNormal = this.normal.slice();
          newNormal[0] = value;
          console.log('update normal', newNormal);
          this.normal = newNormal.map(Number);
        },
      },
      yNormal: {
        get() {
          return this.normal[1];
        },
        set(value) {
          const newNormal = this.normal.slice();
          newNormal[1] = value;
          console.log('update normal', newNormal);
          this.normal = newNormal.map(Number);
        },
      },
      zNormal: {
        get() {
          return this.normal[2];
        },
        set(value) {
          const newNormal = this.normal.slice();
          newNormal[2] = value;
          console.log('update normal', newNormal);
          this.normal = newNormal.map(Number);
        },
      },
      xOrigin: {
        get() {
          return this.origin[0];
        },
        set(value) {
          const newOrigin = this.origin.slice();
          newOrigin[0] = value;
          this.origin = newOrigin.map(Number);
        },
      },
      yOrigin: {
        get() {
          return this.origin[1];
        },
        set(value) {
          const newOrigin = this.origin.slice();
          newOrigin[1] = value;
          this.origin = newOrigin.map(Number);
        },
      },
      zOrigin: {
        get() {
          return this.origin[2];
        },
        set(value) {
          const newOrigin = this.origin.slice();
          newOrigin[2] = value;
          this.origin = newOrigin;
        },
      },
    },
    watch: {
      normalMode() {
        const newNormal = [0, 0, 0];
        newNormal[this.normalMode] = 1;
        if (this.normalMode < 3) {
          console.log(newNormal.map(Number));
          this.normal = newNormal.map(Number);
        }
      },
    },
    methods: Object.assign(
      {
        deleteProxy() {
          if (!this.create) {
            this.$store.commit(Mutations.PROXY_SELECTED_IDS, []);
            this.$store.dispatch(Actions.PROXY_DELETE, this.activeSource);
          } else {
            this.removeActiveModule();
          }
        },
        createProxy() {
          this.createProxyInternal({
            name: 'Clip',
            parentId: this.activeSource,
          });
        },
      },
      mapActions({
        removeActiveModule: Actions.MODULES_ACTIVE_CLEAR,
        createProxyInternal: Actions.PROXY_CREATE,
      })
    ),
  }
);

//       deleteProxy() {
//         if (!this.create) {
//           const id = this.activeProxies[0];
//           this.$store.commit(Mutations.PROXY_SELECTED_IDS, []);
//           this.$store.dispatch(Actions.PROXY_DELETE, id);
//         } else {
//           this.removeActiveModule();
//         }
//       },
//       createProxy() {
//         const parentId = this.activeProxies[0];
//         this.createProxyInternal({ name: 'Clip', parentId });
//       },
//     },
//     mapActions({
//       removeActiveModule: Actions.MODULES_ACTIVE_CLEAR,
//       createProxyInternal: Actions.PROXY_CREATE,
//     })
//   ),
// };
