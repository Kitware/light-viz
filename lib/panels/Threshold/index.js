import DoubleSliderElement from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import clone from 'mout/src/lang/clone';
import React from 'react';
import AbstractPanel from '../AbstractPanel';
import ArraySelector from '../../widgets/ColorBy';

import {
  updateThresholdRange,
  updateThresholdBy,
  getState,
} from '../../client';

import style from 'LightVizStyle/ThresholdPanel.mcss';

export default React.createClass({
  displayName: 'ThresholdPanel',

  propTypes: {
    dataset: React.PropTypes.object,
    hideAdditionalControls: React.PropTypes.bool,
  },

  getInitialState() {
    this.oldState = {
      currentArrayIndex: 0,
      rangeMin: this.props.dataset.data.arrays[0].range[0],
      rangeMax: this.props.dataset.data.arrays[0].range[1],
    };
    return clone(this.oldState);
  },

  componentDidMount() {
    getState('threshold', this, this.refs.modulePanel);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.dataset.autoApply !== nextProps.dataset.autoApply) {
      this.onApply();
    }
  },

  onApply() {
    updateThresholdRange(this.state.rangeMin, this.state.rangeMax);
    updateThresholdBy(this.props.dataset.data.arrays[this.state.currentArrayIndex].name);
    this.setState({ applyDone: true });
    this.oldState = clone(this.state);
  },

  onReset() {
    this.setState(this.oldState);
  },

  setThresholdRangeMin(name, min) {
    const newState = { rangeMin: min, rangeMax: this.state.rangeMax, applyDone: false };
    if (min > this.state.rangeMax) {
      newState.rangeMax = min;
    }
    this.setState(newState);

    if (this.props.dataset.autoApply) {
      updateThresholdRange(min, newState.rangeMax);
    }
  },

  setThresholdRangeMax(name, max) {
    const newState = { rangeMin: this.state.rangeMin, rangeMax: max, applyDone: false };
    if (max < this.state.rangeMin) {
      newState.rangeMin = max;
    }
    this.setState(newState);

    if (this.props.dataset.autoApply) {
      updateThresholdRange(newState.rangeMin, max);
    }
  },

  updateThresholdBy(name, field) {
    this.props.dataset.data.arrays.forEach((array, idx) => {
      if (array.name === field) {
        this.setState({ currentArrayIndex: idx, applyDone: false });
      }
    });
    if (this.props.dataset.autoApply) {
      updateThresholdBy(field);
    }
  },

  updateState(newState) {
    let currentArrayIndex = -1;
    this.props.dataset.data.arrays.forEach((array, idx) => {
      if (array.name === newState.thresholdBy) {
        currentArrayIndex = idx;
      }
    });
    if (currentArrayIndex === -1) {
      currentArrayIndex = 0;
      updateThresholdBy(this.props.dataset.data.arrays[0].name);
    }
    this.oldState.currentArrayIndex = currentArrayIndex;
    this.oldState.rangeMin = newState.rangeMin;
    this.oldState.rangeMax = newState.rangeMax;
    this.setState({ currentArrayIndex, rangeMin: newState.rangeMin, rangeMax: newState.rangeMax });
  },

  render() {
    const needsApply = this.state.rangeMin !== this.oldState.rangeMin ||
      this.state.rangeMax !== this.oldState.rangeMax ||
      this.oldState.currentArrayIndex !== this.state.currentArrayIndex;
    const sliderMin = this.props.dataset.data.arrays[this.state.currentArrayIndex].range[0];
    const sliderMax = this.props.dataset.data.arrays[this.state.currentArrayIndex].range[1];
    return (
      <AbstractPanel
        ref="modulePanel"
        name="threshold"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        moduleName="Threshold"
        onApply={this.onApply}
        onReset={this.onReset}
        needsApply={needsApply}
      >
        <div className={style.contents}>
          <div className={style.thresholdByDiv}>
            <label className={style.thresholdLabel}>Threshold By</label>
            <ArraySelector
              dataset={this.props.dataset}
              ref="arraySelector"
              name="arraySelector"
              noSolid
              onChange={this.updateThresholdBy}
            />
          </div>
          <DoubleSliderElement
            min={sliderMin}
            max={sliderMax}
            name="min"
            value={this.state.rangeMin}
            onChange={this.setThresholdRangeMin}
          />
          <DoubleSliderElement
            min={sliderMin}
            max={sliderMax}
            name="max"
            value={this.state.rangeMax}
            onChange={this.setThresholdRangeMax}
          />
        </div>
      </AbstractPanel>
    );
  },
});
