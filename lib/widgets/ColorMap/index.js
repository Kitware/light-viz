import React from 'react';
import equals from 'mout/src/array/equals';
import ColorMapEditorWidget from 'paraviewweb/src/React/Widgets/ColorMapEditorWidget';

import style from 'LightVizStyle/ColorMapWidget.mcss';


import {
  setColorMapPreset,
  getColorMap,
  updateOpacityMap,
  getOpacityMap,
  listColorMapImages,
  setColorMapRange,
  setColorMapRangeToDataRange,
} from '../../client';

export default React.createClass({

  displayName: 'ColorMap',

  propTypes: {
    dataset: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
    };
  },

  getInitialState() {
    return {
      currentColorMap: 'Cool to Warm',
      currentArray: 0,
      editColorMapMode: false,
      editOpacityMap: false,
      rangeMin: this.props.dataset.data.arrays[0].range[0],
      rangeMax: this.props.dataset.data.arrays[0].range[1],
      presets: {},
      points: [
        { x: this.props.dataset.data.arrays[0].range[0], y: 0.0 },
        { x: this.props.dataset.data.arrays[0].range[1], y: 1.0 },
      ],
    };
  },

  componentWillMount() {
    listColorMapImages(presets => {
      this.setState({ presets });
    });
  },

  componentWillReceiveProps(newProps) {
    if (!equals(newProps.dataset.data.arrays, this.props.dataset.data.arrays)) {
      const newState = { currentArray: this.state.currentArray };
      if (this.state.currentArray >= newProps.dataset.data.arrays.length) {
        newState.currentArray = 0;
      }
      const min = newProps.dataset.data.arrays[newState.currentArray].range[0];
      const max = newProps.dataset.data.arrays[newState.currentArray].range[1];
      if (this.state.rangeMin < min || this.state.rangeMin > max) {
        newState.rangeMin = min;
      }
      if (this.state.rangeMax < min || this.state.rangeMax > max) {
        newState.rangeMax = max;
      }
      this.setState(newState);
      getColorMap(newProps.dataset.data.arrays[newState.currentArray].name,
                  this.loadColorMap);
    }
  },

  setRangeToDataRange() {
    setColorMapRangeToDataRange(this.props.dataset.data.arrays[this.state.currentArray].name,
                                this.rangeUpdatedByServer);
  },

  setRangeToDataRangeOverTime() {
    // The minimum and maximum recorded in the json file are the min/max over time
    const min = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const max = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    setColorMapRange(this.props.dataset.data.arrays[this.state.currentArray].name, [min, max]);
    this.setState({ rangeMin: min, rangeMax: max });
  },

  setOpacityPoints(points) {
    this.setState({ points });
    updateOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name, points);
  },

  setPreset(name) {
    this.setState({ currentColorMap: name });
    setColorMapPreset(this.props.dataset.data.arrays[this.state.currentArray].name, name);
  },

  setRange(range) {
    this.setState({ rangeMin: range[0], rangeMax: range[1] });
    setColorMapRange(this.props.dataset.data.arrays[this.state.currentArray].name, range);
  },

  updateActiveArray(e) {
    const newState = { currentArray: e.target.value };
    const min = this.props.dataset.data.arrays[newState.currentArray].range[0];
    const max = this.props.dataset.data.arrays[newState.currentArray].range[1];
    if (this.state.rangeMin < min || this.state.rangeMin > max) {
      newState.rangeMin = min;
    }
    if (this.state.rangeMax < min || this.state.rangeMax > max) {
      newState.rangeMax = max;
    }
    this.setState(newState);
    getColorMap(this.props.dataset.data.arrays[newState.currentArray].name,
                this.loadColorMap);
  },

  loadOpacityPoints(points) {
    this.setState({ points });
  },

  loadColorMap(preset, range) {
    const newState = { currentColorMap: preset, rangeMin: range[0], rangeMax: range[1] };
    this.setState(newState);
    getOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name,
                  this.loadOpacityPoints);
  },

  rangeUpdatedByServer(newRange) {
    this.setState({ rangeMin: newRange[0], rangeMax: newRange[1] });
  },

  opacityPointsUpdated(controlPoints) {
    this.setState({ points: controlPoints });
    updateOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name, controlPoints);
  },

  render() {
    const min = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const max = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    return (
      <div className={ style.container }>
        <div className={ style.arraySelector } >
          <select onChange={ this.updateActiveArray }>
          {
            this.props.dataset.data.arrays.map((array, idx) =>
              <option key={idx} value={ idx }>{array.name}</option>
            )
          }
          </select>
        </div>
        <ColorMapEditorWidget
          currentPreset={this.state.currentColorMap}
          rangeMin={this.state.rangeMin}
          rangeMax={this.state.rangeMax}
          currentOpacityPoints={this.state.points}
          dataRangeMin={min}
          dataRangeMax={max}
          presets={this.state.presets}
          onOpacityTransferFunctionChanged={this.opacityPointsUpdated}
          onPresetChanged={this.setPreset}
          onRangeEdited={this.setRange}
          onScaleRangeToCurrent={this.setRangeToDataRange}
          onScaleRangeOverTime={this.setRangeToDataRangeOverTime}
        />
      </div>
    );
  },
});
