import samples from 'pvw-lightviz/src/samples';
import { Breakpoints } from 'pvw-lightviz/src/constants';

export default {
  name: 'Landing',
  data() {
    return {
      samples,
    };
  },
  computed: {
    smallScreen() {
      return this.$vuetify.breakpoint.width < Breakpoints.md;
    },
  },
  methods: {
    openSample(sample) {
      const urls = [];
      const names = [];
      for (let i = 0; i < sample.datasets.length; ++i) {
        urls.push(sample.datasets[i].url);
        names.push(sample.datasets[i].name);
      }
      this.$emit('open-urls', urls, names);
    },
  },
};
