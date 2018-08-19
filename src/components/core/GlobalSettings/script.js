import PalettePicker from 'pvw-lightviz/src/components/widgets/PalettePicker';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';

import {
  generateComponentWithServerBinding,
  bool2int,
  toBoolean,
} from 'pvw-lightviz/src/proxyHelper';

function floatToHex2(value) {
  const integer = Math.floor(value * 255);
  if (integer > 15) {
    return integer.toString(16);
  }
  return `0${integer.toString(16)}`;
}

// ----------------------------------------------------------------------------
// Component API
// ----------------------------------------------------------------------------

export default generateComponentWithServerBinding(
  null, // We don't aim to create proxy
  'View',
  {
    bg: { name: 'Background' },
    bg2: { name: 'Background2' },
    gradient: { name: 'UseGradientBackground' },
    axis: {
      name: 'OrientationAxesVisibility',
      clientToServer: bool2int,
      serverToClient: toBoolean,
      autoApply: true,
    },
  },
  {
    name: 'GlobalSettings',
    components: {
      PalettePicker,
    },
    data() {
      return {
        palette: [
          '#000000',
          '#ffffff',
          '#9e0142',
          '#d53e4f',
          '#f46d43',
          '#fdae61',
          '#fee08b',
          '#ffffbf',
          '#e6f598',
          '#abdda4',
          '#66c2a5',
          '#3288bd',
          '#5e4fa2',
          'linear-gradient(#7478be, #c1c3ca)', // from 3D Slicer default
          'linear-gradient(#00002a, #52576e)', // from ParaView
          'linear-gradient(#333333, #999999)',
        ],
      };
    },
    computed: {
      background: {
        get() {
          if (!this.bg) {
            return '#000000';
          }
          if (this.gradient) {
            return `linear-gradient(#${this.bg2
              .map(floatToHex2)
              .join('')}, #${this.bg.map(floatToHex2).join('')})`;
          }
          return `#${this.bg.map(floatToHex2).join('')}`;
        },
        set(value) {
          if (value.indexOf('gradient') !== -1) {
            const values = value
              .replace(/[()]/g, '')
              .split(',')
              .map((i) => i.slice(-7))
              .map((i) => vtkMath.hex2float(i));
            this.bg = values[1];
            this.bg2 = values[0];
            this.gradient = 1;
          } else {
            this.bg = vtkMath.hex2float(value);
            this.gradient = 0;
          }
          // Apply the 3 properties at once
          this.apply();
        },
      },
    },
  }
);
