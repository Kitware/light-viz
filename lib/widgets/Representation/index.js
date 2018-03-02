import React from 'react';
import PropTypes from 'prop-types';
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

export default class Representation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: props.defaultRepresentation,
    };

    this.updateRepresentationTo = this.updateRepresentationTo.bind(this);
  }

  updateRepresentationTo(obj, index) {
    if (this.props.onChange) {
      this.props.onChange(this.props.name, obj.representation);
    }
    this.setState({
      activeIndex: index,
    });
  }

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
  }
}

Representation.propTypes = {
  defaultRepresentation: PropTypes.number,
  name: PropTypes.string,
  onChange: PropTypes.func,
  representations: PropTypes.array,
};

Representation.defaultProps = {
  defaultRepresentation: 1,
  name: 'Representation',
  onChange: null,
  representations: null,
};
