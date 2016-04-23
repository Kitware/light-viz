import React from 'react';
import InlineToggleButton from 'paraviewweb/src/React/Widgets/InlineToggleButtonWidget';


const surfaceImage = require('./surface.png');
const surfaceWithEdgesImage = require('./surface-with-edge.png');
const wireframeImage = require('./wireframe.png');

const representations = [{
  img: wireframeImage,
  representation: 'Wireframe',
}, {
  img: surfaceImage,
  representation: 'Surface',
}, {
  img: surfaceWithEdgesImage,
  representation: 'Surface With Edges',
}];

export default React.createClass({

  displayName: 'Representation',

  propTypes: {
    defaultRepresentation: React.PropTypes.number,
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    representations: React.PropTypes.array,
  },

  getDefaultProps() {
    return {
      defaultRepresentation: 1,
      name: 'Representation',
      onChange: null,
      representations: null,
    };
  },

  getInitialState() {
    return {
      activeIndex: this.props.defaultRepresentation,
    };
  },

  updateRepresentationTo(obj, index) {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, obj.representation);
    }
    this.setState({
      activeIndex: index,
    });
  },

  render() {
    return (
      <InlineToggleButton
        active={ this.state.activeIndex }
        activeColor="#ccc"
        defaultColor="#fff"
        options={ this.props.representations ? this.props.representations : representations }
        onChange={ this.updateRepresentationTo }
      />);
  },
});
