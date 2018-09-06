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
        this.mouseListener.getListeners()
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
      this.imageStream.updateQuality(100, 80);
      this.imageStream.updateResolutionRatio(1, 1);
    });
  },
  data() {
    return {
      orientationLabels: ['X', 'Y', 'Z'],
    };
  },
  computed: mapGetters({
    client: Getters.NETWORK_CLIENT,
  }),
  methods: mapActions({
    updateOrientation: Actions.VIEW_UPDATE_ORIENTATION,
    resetCamera: Actions.VIEW_RESET_CAMERA,
    rollLeft: Actions.VIEW_ROLL_LEFT,
    rollRight: Actions.VIEW_ROLL_RIGHT,
  }),
  beforeDestroy() {
    this.subscription.unsubscribe();
    this.renderer.destroy();
    this.mouseListener.destroy();
    this.imageStream.destroy();
  },
};
