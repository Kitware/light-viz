import DoubleSliderElement from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import clone from 'mout/src/lang/clone';
import React from 'react';
import AbstractPanel from '../AbstractPanel';

import {
  updateThresholdRange,
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
    this.setState({ applyDone: true });
    this.oldState = clone(this.state);
  },

  onReset() {
    this.setState(this.oldState);
  },

  setThresholdRangeMin(name, min) {
    const newState = { rangeMin: min, rangeMax: this.state.rangeMax };
    if (min > this.state.rangeMax) {
      newState.rangeMax = min;
    }
    this.setState(newState);

    if (this.props.dataset.autoApply) {
      updateThresholdRange(min, newState.rangeMax);
    }
  },

  setThresholdRangeMax(name, max) {
    const newState = { rangeMin: this.state.rangeMin, rangeMax: max };
    if (max < this.state.rangeMin) {
      newState.rangeMin = max;
    }
    this.setState(newState);

    if (this.props.dataset.autoApply) {
      updateThresholdRange(newState.rangeMin, max);
    }
  },

  updateThresholdBy(field) {
    this.props.dataset.data.arrays.forEach((array, idx) => {
      if (array.name === field) {
        this.setState({ currentArrayIndex: idx });
      }
    });
  },

  updateState(newState) {
    this.setState({ rangeMin: newState.rangeMin, rangeMax: newState.rangeMax });
  },

  render() {
    const needsApply = this.state.rangeMin !== this.oldState.rangeMin ||
      this.state.rangeMax !== this.oldState.rangeMax;
    const sliderMin = this.props.dataset.data.arrays[this.state.currentArrayIndex].range[0];
    const sliderMax = this.props.dataset.data.arrays[this.state.currentArrayIndex].range[1];
    return (
      <AbstractPanel
        ref="modulePanel"
        name="threshold"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        moduleName="Threshold"
        noSolid
        onApply={this.onApply}
        onLookupTableChange={this.updateThresholdBy}
        onReset={this.onReset}
        needsApply={needsApply}
      >
        <div className={style.contents}>
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
