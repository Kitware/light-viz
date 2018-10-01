import { mapState, mapActions } from 'vuex';
import Mousetrap from 'mousetrap';

import AboutBox from 'paraview-lite/src/components/core/AboutBox';
import ActionModules from 'paraview-lite/src/components/core/ActionModules';
import BrowserIssues from 'paraview-lite/src/components/core/BrowserIssues';
import ControlsDrawer from 'paraview-lite/src/components/core/ControlsDrawer';
import ErrorBox from 'paraview-lite/src/components/core/ErrorBox';
import Landing from 'paraview-lite/src/components/core/Landing';
import LayoutView from 'paraview-lite/src/components/core/LayoutView';
import SvgIcon from 'paraview-lite/src/components/widgets/SvgIcon';
import ProgressBar from 'paraview-lite/src/components/widgets/ProgressBar';
import { Actions } from 'paraview-lite/src/stores/types';
import shortcuts from 'paraview-lite/src/shortcuts';

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
    darkMode() {
      return this.$store.getters.APP_DARK_THEME;
    },
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
      if (this.darkMode) {
        return this.smallScreen ? 'lightviz-small-dark' : 'lightviz-dark';
      }
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
