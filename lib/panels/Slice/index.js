import equals from 'mout/src/array/equals';
import objEquals from 'mout/src/object/equals';
import clone from 'mout/src/lang/clone';
import DoubleSliderElement from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import React from 'react';
import ToggleButton from 'paraviewweb/src/React/Widgets/ToggleIconButtonWidget';
import AbstractPanel from '../AbstractPanel';

import {
  getState,
  updateSlicesVisible,
  updateSlicePosition,
}
from '../../client';

import style from 'LightVizStyle/SlicePanel.mcss';

export default React.createClass({

  displayName: 'SlicePanel',

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
      xVisible: true,
      yVisible: true,
      zVisible: true,
    };
    return clone(this.oldState);
  },

  componentDidMount() {
    getState('slice', this, this.refs.modulePanel);
  },

  componentWillReceiveProps(nextProps) {
    const previous = this.props.dataset.data.bounds;
    const next = nextProps.dataset.data.bounds;

    if (!equals(previous, next)) {
      this.setState({
        xPosition: (next[0] + next[1]) * 0.5,
        yPosition: (next[2] + next[3]) * 0.5,
        zPosition: (next[4] + next[5]) * 0.5,
      });
    }
  },

  onApply() {
    const {
      xPosition, yPosition, zPosition,
    } = this.state;
    const pos = {
      xPosition, yPosition, zPosition,
    };

    updateSlicesVisible(this.state.xVisible, this.state.yVisible, this.state.zVisible);
    updateSlicePosition(pos);
    this.oldState = clone(this.state);
    this.setState({ applyDone: true });
    this.oldState.applyDone = true;
  },

  onReset() {
    this.setState(this.oldState);
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
      applyDone: false,
    });
    this.oldState.applyDone = false;

    // Update server
    pos[name] = value;
    if (this.props.dataset.autoApply) {
      updateSlicePosition(pos);
    }
  },

  toggleSliceVisible(onOff, name) {
    const {
      xVisible, yVisible, zVisible,
    } = this.state;
    const visible = {
      xVisible, yVisible, zVisible,
    };

    this.setState({
      [name]: onOff,
      applyDone: false,
    });
    visible[name] = onOff;
    this.oldState.applyDone = false;

    if (this.props.dataset.autoApply) {
      updateSlicesVisible(visible.xVisible, visible.yVisible, visible.zVisible);
    }
  },

  updateState(newState) {
    this.setState({
      xPosition: newState.xPosition,
      yPosition: newState.yPosition,
      zPosition: newState.zPosition,
      xVisible: newState.xVisible,
      yVisible: newState.yVisible,
      zVisible: newState.zVisible,
    });
    this.oldState = clone(this.state);
  },

  render() {
    const needsApply = !objEquals(this.oldState, this.state);
    return (
      <AbstractPanel
        ref="modulePanel"
        name="slice"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        onApply={this.onApply}
        onReset={this.onReset}
        needsApply={needsApply}
        moduleName="Slice"
      >
        <div className={style.line}>
          <ToggleButton
            alwaysOn
            value={this.state.xVisible}
            icon={this.state.xVisible ? style.toggleOnIcon : style.toggleOffIcon}
            name="xVisible"
            onChange={this.toggleSliceVisible}
            style={{ width: '30px' }}
          />
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[0]}
            max={this.props.dataset.data.bounds[1]}
            value={this.state.xPosition}
            name="xPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <ToggleButton
            alwaysOn
            value={this.state.yVisible}
            icon={this.state.yVisible ? style.toggleOnIcon : style.toggleOffIcon}
            name="yVisible"
            onChange={this.toggleSliceVisible}
            style={{ width: '30px' }}
          />
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[2]}
            max={this.props.dataset.data.bounds[3]}
            value={this.state.yPosition}
            name="yPosition"
            onChange={this.positionChange}
          />
        </div>
        <div className={style.line}>
          <ToggleButton
            alwaysOn
            value={this.state.zVisible}
            icon={this.state.zVisible ? style.toggleOnIcon : style.toggleOffIcon}
            name="zVisible"
            onChange={this.toggleSliceVisible}
            style={{ width: '30px' }}
          />
          <DoubleSliderElement
            min={this.props.dataset.data.bounds[4]}
            max={this.props.dataset.data.bounds[5]}
            value={this.state.zPosition}
            name="zPosition"
            onChange={this.positionChange}
          />
        </div>
      </AbstractPanel>
    );
  },
});
