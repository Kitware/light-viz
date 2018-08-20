import { generateComponentWithServerBinding } from 'pvw-lightviz/src/proxyHelper';

import module from './module';

export default generateComponentWithServerBinding(
  'Sphere',
  'Source',
  {
    startPhi: {
      name: 'StartPhi',
      autoApply: true,
      default: 0,
    },
    endPhi: {
      name: 'EndPhi',
      autoApply: true,
      default: 180,
    },
    phiResolution: {
      name: 'PhiResolution',
      autoApply: true,
      default: 8,
    },
    startTheta: {
      name: 'StartTheta',
      autoApply: true,
      default: 0,
    },
    endTheta: {
      name: 'EndTheta',
      autoApply: true,
      default: 360,
    },
    thetaResolution: {
      name: 'ThetaResolution',
      autoApply: true,
      default: 8,
    },
  },
  {
    name: 'Sphere',
    data() {
      return {
        module,
        color: 'grey darken-2',
      };
    },
    computed: {
      phi: {
        get() {
          return [this.startPhi, this.endPhi];
        },
        set(value) {
          this.startPhi = Number(value[0]);
          this.endPhi = Number(value[1]);
        },
      },
      theta: {
        get() {
          return [this.startTheta, this.endTheta];
        },
        set(value) {
          this.startTheta = Number(value[0]);
          this.endTheta = Number(value[1]);
        },
      },
    },
  }
);
