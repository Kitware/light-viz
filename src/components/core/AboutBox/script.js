import SvgIcon from 'pvw-lightviz/src/components/widgets/SvgIcon';

// ----------------------------------------------------------------------------

export default {
  name: 'AboutBox',
  components: {
    SvgIcon,
  },
  data() {
    return {
      version: window.LIGHTVIZ_VERSION || 'not available',
    };
  },
  computed: {
    darkMode() {
      return this.$store.getters.APP_DARK_THEME;
    },
  },
};
