import WslinkImageStream from 'paraviewweb/src/IO/WebSocket/WslinkImageStream';
import NativeImageRenderer from 'paraviewweb/src/NativeUI/Renderers/NativeImageRenderer';
import VtkWebMouseListener from 'paraviewweb/src/Interaction/Core/VtkWebMouseListener';
import SizeHelper from 'paraviewweb/src/Common/Misc/SizeHelper';

import { mapGetters, mapActions } from 'vuex';
import { Getters, Actions } from 'pvw-lightviz/src/stores/types';

// ----------------------------------------------------------------------------
// Component API
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

export default {
  name: 'View3D',
  mounted() {
    const container = this.$el.querySelector('.js-renderer');
    const client = this.client.remote;
    this.imageStream = WslinkImageStream.newInstance({ client });
    this.imageStream.connect({}).then(() => {
      this.mouseListener = new VtkWebMouseListener(client);

      // Attach interaction listener for image quality
      this.mouseListener.onInteraction((interact) => {
        if (this.interacting === interact) {
          return;
        }
        this.interacting = interact;
        if (interact) {
          this.imageStream.startInteractiveQuality();
        } else {
          this.imageStream
            .stopInteractiveQuality()
            .then(this.imageStream.invalidateCache);
          setTimeout(this.imageStream.invalidateCache, 500);
        }
      });

      this.renderer = new NativeImageRenderer(
        container,
        this.imageStream,
        this.mouseListener.getListeners(),
        this.showRenderingStats
      );

      const sizeChange = () => {
        this.renderer.resize();
        const { clientWidth, clientHeight } = this.renderer.size;
        this.mouseListener.updateSize(clientWidth, clientHeight);
        this.imageStream.setViewSize(clientWidth, clientHeight);
      };

      // On resize
      this.subscription = SizeHelper.onSizeChange(sizeChange);
      sizeChange();
      this.imageStream.stillRender();

      // Initial config
      this.updateQuality();
      this.updateRatio();
      this.mouseListener.setThrottleTime(this.mouseThrottle);
      this.imageStream.setMaxFrameRate(this.maxFPS);
    });
  },
  data() {
    return {
      orientationLabels: ['X', 'Y', 'Z'],
    };
  },
  computed: mapGetters({
    client: Getters.NETWORK_CLIENT,
    showRenderingStats: Getters.VIEW_STATS,
    stillQuality: Getters.VIEW_QUALITY_STILL,
    interactiveQuality: Getters.VIEW_QUALITY_INTERACTIVE,
    stillRatio: Getters.VIEW_RATIO_STILL,
    interactiveRatio: Getters.VIEW_RATIO_INTERACTIVE,
    mouseThrottle: Getters.VIEW_MOUSE_THROTTLE,
    maxFPS: Getters.VIEW_FPS_MAX,
  }),
  watch: {
    showRenderingStats() {
      this.renderer.setDrawFPS(this.showRenderingStats);
    },
    stillQuality() {
      this.updateQuality();
    },
    interactiveQuality() {
      this.updateQuality();
    },
    stillRatio() {
      this.updateRatio();
    },
    interactiveRatio() {
      this.updateRatio();
    },
    mouseThrottle() {
      this.mouseListener.setThrottleTime(this.mouseThrottle);
    },
    maxFPS() {
      this.imageStream.setMaxFrameRate(this.maxFPS);
    },
  },
  methods: Object.assign(
    {
      updateQuality() {
        this.imageStream.updateQuality(
          this.stillQuality,
          this.interactiveQuality
        );
      },
      updateRatio() {
        this.imageStream.updateResolutionRatio(
          this.stillRatio,
          this.interactiveRatio
        );
      },
    },
    mapActions({
      updateOrientation: Actions.VIEW_UPDATE_ORIENTATION,
      resetCamera: Actions.VIEW_RESET_CAMERA,
      rollLeft: Actions.VIEW_ROLL_LEFT,
      rollRight: Actions.VIEW_ROLL_RIGHT,
    })
  ),
  beforeDestroy() {
    this.subscription.unsubscribe();
    this.renderer.destroy();
    this.mouseListener.destroy();
    this.imageStream.destroy();
  },
};
