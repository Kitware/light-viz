import equals from 'mout/src/array/equals';
import objEquals from 'mout/src/object/equals';
import clone from 'mout/src/lang/clone';
import DoubleSliderElement from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import NumberSliderElement from 'paraviewweb/src/React/Widgets/NumberSliderWidget';
import React from 'react';
import AbstractPanel from '../AbstractPanel';
import ColorBy from '../../widgets/ColorBy';

import {
  getState,
  updateStreamlineSeedPoint,
  updateStreamlineVector,
  updateStreamlineNumPoints,
  updateStreamlineSeedRadius,
}
from '../../client';

import style from 'LightVizStyle/StreamlinePanel.mcss';

function arrayIsAVector(array) {
  return array.dimension === 3;
}

export default React.createClass({

  displayName: 'StreamlinePanel',

  propTypes: {
    dataset: React.PropTypes.object,
    hideAdditionalControls: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      dataset: {
        data: {
          bounds: [0, 1, 0, 1, 0, 1],
        },
      },
    };
  },

  getInitialState() {
    this.oldState = {
      xPosition: (this.props.dataset.data.bounds[0] + this.props.dataset.data.bounds[1]) * 0.5,
      yPosition: (this.props.dataset.data.bounds[2] + this.props.dataset.data.bounds[3]) * 0.5,
      zPosition: (this.props.dataset.data.bounds[4] + this.props.dataset.data.bounds[5]) * 0.5,
      numPoints: 50,
      vector: '',
    };
    return clone(this.oldState);
  },

  componentDidMount() {
    getState('streamline', this, this.refs.modulePanel);
  },

  componentWillReceiveProps(nextProps) {
    const previous = this.props.dataset.data.bounds;
    const next = nextProps.dataset.data.bounds;

    if (!equals(previous, next)) {
      this.setState({
        xPosition: (next[0] + next[1]) * 0.5,
        yPosition: (next[2] + next[3]) * 0.5,
        zPosition: (next[4] + next[5]) * 0.5,
        raduis: Math.min(next[1] - next[0], next[3] - next[2], next[5] - next[4]) / 8.0,
      });
    }
    if (!equals(nextProps.dataset, this.props.dataset)) {
      const arrays = nextProps.dataset.data.arrays;
      for (let i = 0; i < arrays.length; ++i) {
        if (arrays[i].dimension === 3) {
          this.setState({
            vector: arrays[i].name,
          });
          break;
        }
      }
    }
  },

  onApply() {
    const {
      xPosition, yPosition, zPosition,
    } = this.state;
    const pos = {
      xPosition, yPosition, zPosition,
    };
    updateStreamlineSeedPoint(pos);
    updateStreamlineVector(this.state.vector);
    updateStreamlineNumPoints(this.state.numPoints);
    updateStreamlineSeedRadius(this.state.radius);
    this.oldState = clone(this.state);
  },

  onReset() {
    this.setState(this.oldState);
  },

  updateState(newState) {
    this.oldState = {
      xPosition: newState.xPosition,
      yPosition: newState.yPosition,
      zPosition: newState.zPosition,
      numPoints: newState.numPoints,
      vector: newState.vector,
    };
    this.setState(clone(this.oldState));
  },

  updateVectors(newVector) {
    this.setState({
      vector: newVector,
    });
    if (this.props.dataset.autoApply) {
      updateStreamlineVector(newVector);
    }
  },

  updateNumPoints(e) {
    const value = e.target.value;
    this.setState({
      numPoints: value,
    });
    if (this.props.dataset.autoApply) {
      updateStreamlineNumPoints(value);
    }
  },

  updateRadius(name, value) {
    this.setState({
      radius: value,
    });
    if (this.props.dataset.autoApply) {
      updateStreamlineSeedRadius(value);
    }
  },

  positionChange(name, value) {
    const {
      xPosition, yPosition, zPosition,
    } = this.state;
    const pos = {
      xPosition, yPosition, zPosition,
    };

    this.setState({
      [name]: value,
    });

    // Update server
    pos[name] = value;
    if (this.props.dataset.autoApply) {
      updateStreamlineSeedPoint(pos);
    }
  },

  render() {
    const needsApply = !objEquals(this.oldState, this.state);
    const lengths = [this.props.dataset.data.bounds[1] - this.props.dataset.data.bounds[0],
                     this.props.dataset.data.bounds[3] - this.props.dataset.data.bounds[2],
                     this.props.dataset.data.bounds[5] - this.props.dataset.data.bounds[4]];
    return (
      <AbstractPanel
        ref="modulePanel"
        allowVolumeRepresentation
        name="streamline"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        hideInputSelection
        onApply={this.onApply}
        onReset={this.onReset}
        needsApply={needsApply}
        moduleName="Streamline"
      >
        <div className={style.line}>
          <label>Vector</label>
          <ColorBy
            className={style.colorByItem}
            dataset={this.props.dataset}
            noSolid
            onChange={this.updateVector}
            shouldIncludeArray={arrayIsAVector}
          />
        </div>
        <div className={style.line}>
          <label>X</label>
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[0]}
            max={this.props.dataset.data.bounds[1]}
            value={this.state.xPosition}
            name="xPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <label>Y</label>
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[2]}
            max={this.props.dataset.data.bounds[3]}
            value={this.state.yPosition}
            name="yPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <label>Z</label>
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[4]}
            max={this.props.dataset.data.bounds[5]}
            value={this.state.zPosition}
            name="zPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <label>Points</label>
          <NumberSliderElement
            min={1}
            max={300}
            value={this.state.numPoints}
            name="numPoints"
            onChange={this.updateNumPoints}
          />
        </div>
        <div className={style.line}>
          <label>Radius</label>
          <DoubleSliderElement
            min={0}
            max={Math.min(lengths[0], lengths[1], lengths[2])}
            value={this.state.radius}
            name="radius"
            onChange={this.updateRadius}
          />
        </div>
      </AbstractPanel>
    );
  },
});

