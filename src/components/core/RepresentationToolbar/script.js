import { generateComponentWithServerBinding } from 'pvw-lightviz/src/proxyHelper';
import { Actions } from 'pvw-lightviz/src/stores/types';

const SEPARATOR = ':|:';
const SOLID_COLOR_ITEM = {
  text: 'Solid Color',
  value: `SOLID${SEPARATOR}${SEPARATOR}`,
};

export default generateComponentWithServerBinding(
  null,
  'Representation',
  {
    representation: {
      name: 'Representation',
      autoApply: true,
      default: 'Surface',
    },
    opacity: {
      name: 'Opacity',
      autoApply: true,
      default: 1,
    },
  },
  {
    name: 'RepresentationToolbar',
    data() {
      return {
        vectorComponent: 0,
      };
    },
    computed: {
      colorValue() {
        if (this.activeProxyData) {
          const [
            location,
            name,
            vectorComponent,
          ] = this.activeProxyData.colorBy.array;
          const mode =
            location && name.length && this.activeProxyData.colorBy.mode;
          this.vectorComponent = vectorComponent;

          // console.log(JSON.stringify(this.activeProxyData.colorBy, null, 2));

          if (mode !== 'array') {
            return SOLID_COLOR_ITEM;
          }

          return {
            text: name,
            value: `${mode}${SEPARATOR}${location}${SEPARATOR}${name}`,
          };
        }
        return SOLID_COLOR_ITEM;
      },
      representationItems() {
        if (this.activeProxyData) {
          return this.activeProxyData.ui.find(
            (prop) => prop.name === 'Representation'
          ).values;
        }
        return [];
      },
      colorByItems() {
        const list = [SOLID_COLOR_ITEM];
        this.inputArrays.forEach((array) => {
          if (array.size < 4 && array.location !== 'FIELDS') {
            list.push({
              value: `array${SEPARATOR}${array.location}${SEPARATOR}${
                array.name
              }`,
              text: array.name,
            });
            // for (let i = 0; i < array.range.length; i++) {
            //   list.push(`${array.location}|${array.name}|${i - 1}`);
            // }
          }
        });
        // console.log('LIST', this.inputArrays, list.join('\n'));
        return list;
      },
    },
    methods: {
      applyColor(arg) {
        if (!arg || !arg.value) {
          return;
        }
        const { value } = arg;
        const representationId = this.activeRepresentationId;
        const [colorMode, arrayLocation, arrayName] = value.split(SEPARATOR);
        const vectorMode = 'Magnitude';
        const vectorComponent = this.vectorComponent;
        const rescale = true;

        this.$store.dispatch(Actions.COLOR_BY, {
          colorMode,
          representationId,
          arrayLocation,
          arrayName,
          vectorMode,
          vectorComponent,
          rescale,
        });

        this.blur('colorBy');
      },
      blur(componentName) {
        this.$nextTick(this.$refs[componentName].blur);
        // console.log(JSON.stringify(this.activeProxyData, null, 2));
      },
    },
  }
);
