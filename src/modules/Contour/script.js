import {
  generateComponentWithServerBinding,
  bool2int,
  toBoolean,
} from 'pvw-lightviz/src/proxyHelper';

import module from './module';

export default generateComponentWithServerBinding(
  'Contour',
  'Source',
  {
    computeNormals: {
      name: 'ComputeNormals',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: false,
      default: 1,
    },
    computeGradients: {
      name: 'ComputeGradients',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: false,
      default: 0,
    },
    computeScalars: {
      name: 'ComputeScalars',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: false,
      default: 1,
    },
    generateTriangles: {
      name: 'GenerateTriangles',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: false,
      default: 1,
    },
    isosurfaces: {
      name: 'ContourValues',
      label: 'Isosurfaces',
      autoApply: false,
      default: [0],
    },
    contourBy: {
      name: 'SelectInputScalars',
      label: 'ContourBy',
      autoApply: false,
      clientToServer: (v) => ['POINTS', v],
      serverToClient: (v) => (v ? v[1] : ''),
      default: ['POINTS'],
    },
  },
  {
    name: 'Contour',
    data() {
      return {
        module,
        color: 'grey darken-2',
        isoRange: [0, 1],
      };
    },
    mounted() {
      if (this.create) {
        this.contourBy = this.contourByArrays[0];
      }
    },
    computed: {
      // contourByArray() {
      //   return this.inputArrays.find(
      //     (array) =>
      //       array.location === 'POINTS' &&
      //       array.size === 1 &&
      //       array.name === this.contourBy
      //   );
      // },
      contourByArrays() {
        return this.inputArrays
          .filter((array) => array.location === 'POINTS' && array.size === 1)
          .map((a) => a.name);
      },
      isosurface: {
        get() {
          // register dependency
          this.mtime; // eslint-disable-line
          return this.isosurfaces[0];
        },
        set(value) {
          this.mtime++;
          this.isosurfaces = [Number(value)];
          this.$forceUpdate();
        },
      },
    },
    watch: {
      contourBy() {
        console.log('contourBy');
        const { min, max } = this.inputArrays.find(
          (array) =>
            array.location === 'POINTS' &&
            array.size === 1 &&
            array.name === this.contourBy
        ).range[0];
        this.isoRange = [min, max];
        this.isosurfaces = [(this.isoRange[0] + this.isoRange[1]) * 0.5];
        console.log('update isosurface', this.isosurface, this.isosurfaces);
        this.$nextTick(this.$forceUpdate);
      },
    },
  }
);
