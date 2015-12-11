import BinaryImageStream   from 'tonic-io/lib/BinaryImageStream';
import createFactory       from 'tonic-io/lib/VtkWeb/client/pvw';
import NativeImageRenderer from 'tonic-ui/lib/native/renderer/Image';
import * as sizeHelper     from 'tonic-ui/lib/util/SizeHelper';
import SmartConnect        from 'tonic-io/lib/VtkWeb/SmartConnect';
import VtkWebMouseListener from 'tonic-ui/lib/interaction/VtkWebMouseListener';

// Load CSS
require('./style.css');

// Global variables
var smartConnect = null,
    binaryImageStream = null,
    mouseListener = null,
    pvwClient = null,
    subscriptions = [],
    imageRenderer = null,
    pvwContainer = document.querySelector('.pvw-renderer');

// Handle connection
function initializeApp(connectionConfig) {
    try {
        pvwClient = createFactory(connectionConfig, [ 'MouseHandler', 'ViewPort', 'ViewPortImageDelivery' ]);
        binaryImageStream = new BinaryImageStream(connectionConfig.urls + 'b', 100, 25);
        mouseListener = new VtkWebMouseListener(pvwClient);

        // Attach interaction listener for image quality
        mouseListener.onInteraction( (interact) => {
            if(interact) {
                binaryImageStream.startInteractiveQuality();
            } else {
                binaryImageStream.stopInteractiveQuality();
            }
        });

        // Attach size listener
        sizeHelper.onSizeChange( () => {
            var { clientWidth, clientHeight } = sizeHelper.getSize(pvwContainer);
            mouseListener.updateSize(clientWidth, clientHeight);
            pvwClient.ViewPortImageDelivery.stillRender({ view: -1, size: [ clientWidth, clientHeight ] });
        });

        // Create render
        imageRenderer = new NativeImageRenderer(pvwContainer, binaryImageStream, mouseListener.getListeners());

        // Establish image stream connection
        binaryImageStream.connect({view_id: -1});

        // Validate component size
        sizeHelper.triggerChange();
    } catch(e){
        console.log(e);
    }
}

// Exposed method
export function connect(config={}) {
    smartConnect = new SmartConnect(config);
    subscriptions.push(smartConnect.onConnectionReady(initializeApp));
    smartConnect.connect();
}
