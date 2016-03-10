import React from 'react';
import InlineToggleButton from 'paraviewweb/src/React/Widgets/InlineToggleButtonWidget';


const surfaceImage = require('./surface.png');
const surfaceWithEdgesImage = require('./surface-with-edge.png');
const wireframeImage = require('./wireframe.png');
const volumeImage = require('./volume.png');

const representations = [ { img: wireframeImage, representation: 'Wireframe' },
                          { img: surfaceImage, representation: 'Surface' },
                          { img: surfaceWithEdgesImage, representation: 'Surface With Edges' },
                          { img: volumeImage, representation: 'Volume'}];

export default React.createClass({

    displayName: 'Representation',

    propTypes: {
        name: React.PropTypes.string,
        onChange: React.PropTypes.func,
        showVolume: React.PropTypes.bool,
    },

    getDefaultProps() {
        return {
            name: 'Representation',
            onChange: null,
            showVolume: false,
        };
    },

    getInitialState() {
        return {
            activeIndex: 1,
        };
    },

    updateRepresentationTo(obj, index) {
        if(this.props.onChange) {
            this.props.onChange(this.props.name, obj.representation);
        }
        this.setState({activeIndex: index})
    },

    render() {
        return <InlineToggleButton
                      active={ this.state.activeIndex }
                      activeColor='#ccc'
                      defaultColor='#fff'
                      options={ this.props.showVolume ? representations : representations.slice(0,3) }
                      onChange={ this.updateRepresentationTo } />;
    },
});
