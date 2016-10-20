import React from 'react';
import equals from 'mout/src/array/equals';
import ColorMapEditorWidget from 'paraviewweb/src/React/Widgets/ColorMapEditorWidget';
import CollapsibleWidget from 'paraviewweb/src/React/Widgets/CollapsibleWidget';
import DropDownWidget from 'paraviewweb/src/React/Widgets/DropDownWidget';

import style from 'LightVizStyle/ColorMapWidget.mcss';

import {
  setColorMapPreset,
  getColorMap,
  listColorMapImages,
  setColorMapRange,
  setColorMapRangeToDataRange,
} from '../../client';

import {
  setOpacityPoints,
  updateArrayRange,
  initializeArrayOpacities,
  getOpacityPoints,
  addOpacityMapObserver,
  removeOpacityMapObserver,
} from './OpacityMapSyncer';

export default React.createClass({

  displayName: 'ColorMap',

  propTypes: {
    dataset: React.PropTypes.object,
    disableCollapse: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      disableCollapse: false,
    };
  },

  getInitialState() {
    initializeArrayOpacities(this.props.dataset.data.arrays);
    addOpacityMapObserver(this.props.dataset.data.arrays[0].name, this);
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
    listColorMapImages((presets) => {
      this.setState({ presets });
    });
  },

  componentWillReceiveProps(newProps) {
    if (!equals(newProps.dataset.data.arrays, this.props.dataset.data.arrays)) {
      removeOpacityMapObserver(this.props.dataset.data.arrays[this.state.currentArray].name, this);
      initializeArrayOpacities(newProps.dataset.data.arrays);
      const newState = { currentArray: this.state.currentArray };
      if (this.state.currentArray >= newProps.dataset.data.arrays.length) {
        newState.currentArray = 0;
      }
      addOpacityMapObserver(newProps.dataset.data.arrays[newState.currentArray].name, this);
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

  onPieceWiseEditorChanged(controlPoints) {
    if (!equals(controlPoints, this.state.points)) {
      setOpacityPoints(this.props.dataset.data.arrays[this.state.currentArray].name, controlPoints);
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
    updateArrayRange(this.props.dataset.data.arrays[this.state.currentArray].name, [min, max]);
    this.setState({ rangeMin: min, rangeMax: max });
  },


  setPreset(name) {
    this.setState({ currentColorMap: name });
    setColorMapPreset(this.props.dataset.data.arrays[this.state.currentArray].name, name);
  },

  setRange(range) {
    this.setState({ rangeMin: range[0], rangeMax: range[1] });
    updateArrayRange(this.props.dataset.data.arrays[this.state.currentArray].name, range);
    setColorMapRange(this.props.dataset.data.arrays[this.state.currentArray].name, range);
  },

  updateActiveArray(arrayLocLabel) {
    const [location, label] = arrayLocLabel.split(': ');
    let currentArray = -1;
    this.props.dataset.data.arrays.forEach((item, index) => {
      if (currentArray !== -1) {
        return;
      }
      if (item.label === label && item.location === location) {
        currentArray = index;
        return;
      }
    });

    const newState = { currentArray };
    const min = this.props.dataset.data.arrays[newState.currentArray].range[0];
    const max = this.props.dataset.data.arrays[newState.currentArray].range[1];
    removeOpacityMapObserver(this.props.dataset.data.arrays[this.state.currentArray].name, this);
    if (this.state.rangeMin < min || this.state.rangeMin > max) {
      newState.rangeMin = min;
    }
    if (this.state.rangeMax < min || this.state.rangeMax > max) {
      newState.rangeMax = max;
    }
    addOpacityMapObserver(this.props.dataset.data.arrays[newState.currentArray].name, this);
    newState.points = getOpacityPoints(this.props.dataset.data.arrays[newState.currentArray].name);
    this.setState(newState);
    getColorMap(this.props.dataset.data.arrays[newState.currentArray].name,
                this.loadColorMap);
  },

  opacityPointsUpdated(name, points) {
    this.setState({ points });
  },

  arrayRangeUpdated(name, range) {
    this.setState({ rangeMin: range[0], rangeMax: range[1] });
  },

  loadColorMap(preset, range) {
    const newState = { currentColorMap: preset, rangeMin: range[0], rangeMax: range[1] };
    newState.points = getOpacityPoints(this.props.dataset.data.arrays[this.state.currentArray].name);
    this.setState(newState);
  },

  rangeUpdatedByServer(newRange) {
    this.setState({ rangeMin: newRange[0], rangeMax: newRange[1] });
    updateArrayRange(this.props.dataset.data.arrays[this.state.currentArray].name, newRange);
  },

  render() {
    // Stupid guard as DropDownWidget is not aware when its prop change
    if (!this.props.dataset
      || !this.props.dataset.data || !this.props.dataset.data.arrays
      || !this.props.dataset.data.arrays.length || !this.props.dataset.data.arrays[0].label) {
      return null;
    }

    const min = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const max = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    return (
      <CollapsibleWidget
        className={style.container}
        title="ColorMap"
        activeSubTitle
        disableCollapse={this.props.disableCollapse}
        subtitle={
          <DropDownWidget
            field={`${this.props.dataset.data.arrays[this.state.currentArray].location}: ${this.props.dataset.data.arrays[this.state.currentArray].label}`}
            fields={this.props.dataset.data.arrays.map(item => `${item.location}: ${item.label}`)}
            onChange={this.updateActiveArray}
          />
        }
      >
        <ColorMapEditorWidget
          currentPreset={this.state.currentColorMap}
          rangeMin={this.state.rangeMin}
          rangeMax={this.state.rangeMax}
          currentOpacityPoints={this.state.points}
          dataRangeMin={min}
          dataRangeMax={max}
          presets={this.state.presets}
          onOpacityTransferFunctionChanged={this.onPieceWiseEditorChanged}
          onPresetChanged={this.setPreset}
          onRangeEdited={this.setRange}
          onScaleRangeToCurrent={this.setRangeToDataRange}
          onScaleRangeOverTime={this.setRangeToDataRangeOverTime}
          pieceWiseHeight={150}
        />
      </CollapsibleWidget>
    );
  },
});
