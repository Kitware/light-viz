import { mapState, mapActions } from 'vuex';
import Mousetrap from 'mousetrap';

import AboutBox from 'pvw-lightviz/src/components/core/AboutBox';
import ActionModules from 'pvw-lightviz/src/components/core/ActionModules';
import BrowserIssues from 'pvw-lightviz/src/components/core/BrowserIssues';
import ControlsDrawer from 'pvw-lightviz/src/components/core/ControlsDrawer';
import ErrorBox from 'pvw-lightviz/src/components/core/ErrorBox';
import Landing from 'pvw-lightviz/src/components/core/Landing';
import LayoutView from 'pvw-lightviz/src/components/core/LayoutView';
import SvgIcon from 'pvw-lightviz/src/components/widgets/SvgIcon';
import ProgressBar from 'pvw-lightviz/src/components/widgets/ProgressBar';
import { Actions } from 'pvw-lightviz/src/stores/types';
import shortcuts from 'pvw-lightviz/src/shortcuts';

// ----------------------------------------------------------------------------
// Component API
// ----------------------------------------------------------------------------

export default {
  name: 'App',
  components: {
    AboutBox,
    ActionModules,
    BrowserIssues,
    ControlsDrawer,
    ErrorBox,
    Landing,
    LayoutView,
    SvgIcon,
    ProgressBar,
  },
  props: {},
  data() {
    return {
      aboutDialog: false,
      errorDialog: false,
      controlsDrawer: false,
      errors: [],
    };
  },
  computed: mapState({
    busyPercent(state) {
      return state.busy.progress;
    },
    landingVisible: (state) => state.route === 'landing',
    smallScreen() {
      // vuetify xs is 600px, but our buttons collide at around 700.
      return this.$vuetify.breakpoint.smAndDown;
    },
    dialogType() {
      return this.smallScreen ? 'v-bottom-sheet' : 'v-dialog';
    },
    iconLogo() {
      return this.smallScreen ? 'lightviz-small' : 'lightviz';
    },
  }),
  watch: {
    landingVisible(value) {
      // matches the mobile breakpoint for navigation-drawer
      if (!value && this.$vuetify.breakpoint.mdAndUp) {
        this.controlsDrawer = true;
      } else if (value) {
        this.controlsDrawer = false;
      }
    },
  },
  mounted() {
    // attach keyboard shortcuts
    shortcuts.forEach(({ key, action }) => {
      if (Actions[action]) {
        Mousetrap.bind(key, (e) => {
          e.preventDefault();
          this.$store.dispatch(Actions[action]);
        });
      }
    });

    // listen for errors
    window.addEventListener('error', this.recordError);

    // listen for errors via console.error
    if (window.console) {
      this.origConsoleError = window.console.error;
      window.console.error = (...args) => {
        this.recordError(args.join(' '));
        return this.origConsoleError(...args);
      };
    }
  },
  beforeDestroy() {
    window.removeEventListener('error', this.recordError);

    if (this.origConsoleError) {
      window.console.error = this.origConsoleError;
    }

    shortcuts.forEach(({ key, action }) => {
      if (Actions[action]) {
        Mousetrap.unbind(key);
      }
    });
  },
  methods: Object.assign(
    {
      recordError(error) {
        this.errors.push(error);
      },
      toggleLanding() {
        if (this.landingVisible) {
          this.showApp();
        } else {
          this.showLanding();
        }
      },
    },
    mapActions({
      showApp: Actions.APP_ROUTE_RUN,
      showLanding: Actions.APP_ROUTE_LANDING,
      connect: Actions.NETWORK_CONNECT,
    })
  ),
};
