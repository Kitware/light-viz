import RepresentationToolbar from 'pvw-lightviz/src/components/core/RepresentationToolbar';
import VtkView from 'pvw-lightviz/src/components/core/View';
import { Breakpoints } from 'pvw-lightviz/src/constants';

// ----------------------------------------------------------------------------
// Component API
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

export default {
  name: 'LayoutView',
  computed: {
    smallScreen() {
      return this.$vuetify.breakpoint.width < Breakpoints.md;
    },
  },
  components: {
    RepresentationToolbar,
    VtkView,
  },
};
