import { mapGetters, mapActions } from 'vuex';
import { Getters, Actions, Mutations } from 'pvw-lightviz/src/stores/types';

import module from './module';

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export default {
  name: 'Sphere',
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
      phi: [0, 180],
      theta: [0, 360],
      phiResolution: 8,
      thetaResolution: 8,
    };
  },
  computed: mapGetters({
    client: Getters.NETWORK_CLIENT,
    proxies: Getters.PROXY_SELECTED_IDS,
  }),
  watch: {
    /*
      Center
      EndPhi
      EndTheta
      PhiResolution
      Radius
      StartPhi
      StartTheta
      ThetaResolution
    */
    phi() {
      this.updateFields(['StartPhi', 'EndPhi'], this.phi);
    },
    theta() {
      this.updateFields(['StartTheta', 'EndTheta'], this.theta);
    },
    thetaResolution() {
      this.updateFields(['ThetaResolution'], [this.thetaResolution]);
    },
    phiResolution() {
      this.updateFields(['PhiResolution'], [this.phiResolution]);
    },
  },
  methods: Object.assign(
    {
      updateFields(fields, values) {
        const id = this.proxies[0];
        const changeSet = fields.map((name, idx) => ({
          id,
          name,
          value: values[idx],
        }));
        this.$store.dispatch(Actions.PROXY_UPDATE, changeSet);
      },
      deleteProxy() {
        if (!this.create) {
          const id = this.proxies[0];
          this.$store.commit(Mutations.PROXY_SELECTED_IDS_SET, []);
          this.$store.dispatch(Actions.PROXY_DELETE, id);
        } else {
          this.removeActiveModule();
        }
      },
      createProxy() {
        console.log('create');
      },
    },
    mapActions({ removeActiveModule: Actions.MODULES_ACTIVE_CLEAR })
  ),
};
