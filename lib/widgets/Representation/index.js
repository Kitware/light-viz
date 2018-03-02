import React from 'react';
import InlineToggleButton from 'paraviewweb/src/React/Widgets/InlineToggleButtonWidget';

import surfaceImage from './surface.png';
import surfaceWithEdgesImage from './surface-with-edge.png';
import wireframeImage from './wireframe.png';

const representations = [
  {
    img: wireframeImage,
    representation: 'Wireframe',
  },
  {
    img: surfaceImage,
    representation: 'Surface',
  },
  {
    img: surfaceWithEdgesImage,
    representation: 'Surface With Edges',
  },
];

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
    if (this.props.representations && this.props.representations.length === 0) {
      return <div />;
    }
    return (
      <InlineToggleButton
        active={this.state.activeIndex}
        activeColor="#ccc"
        defaultColor="#fff"
        options={
          this.props.representations
            ? this.props.representations
            : representations
        }
        onChange={this.updateRepresentationTo}
      />
    );
  },
});
