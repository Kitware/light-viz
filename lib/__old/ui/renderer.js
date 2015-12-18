import BinaryImageStream   from 'tonic-io/lib/BinaryImageStream';
import NativeImageRenderer from 'tonic-ui/lib/native/renderer/Image';
import * as sizeHelper     from 'tonic-ui/lib/util/SizeHelper';
import VtkWebMouseListener from 'tonic-ui/lib/interaction/VtkWebMouseListener';
import * as React          from 'react';
import * as ReactDOM       from 'react-dom';


export default React.createClass({

    componentDidMount() {
        var container = ReactDOM.findDOMNode(this);
        this.binaryImageStream = new BinaryImageStream(this.props.connection.urls + 'b', 100, 25);
        this.mouseListener = new VtkWebMouseListener(this.props.client);

        // Attach interaction listener for image quality
        this.mouseListener.onInteraction( (interact) => {
            if(interact) {
                this.binaryImageStream.startInteractiveQuality();
            } else {
                this.binaryImageStream.stopInteractiveQuality();
            }
        });

        // Attach size listener
        this.subscription = sizeHelper.onSizeChange( () => {
            var { clientWidth, clientHeight } = sizeHelper.getSize(container);
            this.mouseListener.updateSize(clientWidth, clientHeight);
            this.props.client.session.call('light.viz.viewport.size', [-1, clientWidth, clientHeight]);
        });

        // Create render
        this.imageRenderer = new NativeImageRenderer(container, this.binaryImageStream, this.mouseListener.getListeners());

        // Establish image stream connection
        this.binaryImageStream.connect({view_id: -1});

        // Update size
        sizeHelper.triggerChange();
    },

    componentWillMount() {
        // Make sure we monitor window size if it is not already the case
        sizeHelper.startListening();
    },

    componentWillUnmount() {
        if(this.binaryImageStream) {
            this.binaryImageStream.destroy();
            this.binaryImageStream = null;
        }

        if(this.mouseListener) {
            this.mouseListener.destroy();
            this.mouseListener = null;
        }

        if(this.imageRenderer) {
            this.imageRenderer.destroy();
            this.imageRenderer = null;
        }

        if(this.subscription){
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    },

    render() {
        return <div className='RendererPanel'></div>;
    }
});

