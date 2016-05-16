import React from 'react';
import clone from 'mout/src/lang/clone';
import equals from 'mout/src/array/equals';
import LinearPieceWiseEditor from 'paraviewweb/src/NativeUI/Canvas/LinearPieceWiseEditor';

import style from 'LightVizStyle/ColorMapWidget.mcss';

import coolToWarmImage from './coolToWarm.png';
import viridisImage from './viridis.png';
import blackbodyImage from './blackbody.png';

import {
  setColorMapPreset,
  getColorMap,
  updateOpacityMap,
  getOpacityMap,
  setColorMapRange,
  setColorMapRangeToDataRange,
} from '../../client';

export const colorMaps = [{
  name: 'Cool to Warm',
  label: 'Cool to Warm',
  icon: coolToWarmImage,
}, {
  name: 'Viridis (matplotlib)',
  label: 'Viridis',
  icon: viridisImage,
}, {
  name: 'Black-Body Radiation',
  label: 'Blackbody',
  icon: blackbodyImage,
}];

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
      currentColorMap: 0,
      currentArray: 0,
      editColorMapMode: false,
      editOpacityMap: false,
      rangeMin: this.props.dataset.data.arrays[0].range[0],
      rangeMax: this.props.dataset.data.arrays[0].range[1],
      points: [{ x: 0.0, y: 0.0 }, { x: 1.0, y: 1.0 }],
    };
  },

  componentDidMount() {
    const container = this.refs.canvas;
    this.editor = new LinearPieceWiseEditor(container);

    this.editor.onChange(this.opacityPointsUpdated);

    this.editor.render();
  },

  componentWillReceiveProps(newProps) {
    if (!equals(newProps.dataset.data.arrays, this.props.dataset.data.arrays)) {
      const newState = { currentArray: this.state.currentArray };
      if (this.state.currentArray >= newProps.dataset.data.arrays.length) {
        newState.currentColorMap = 0;
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
    getOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name,
                  this.loadOpacityPoints);
  },

  rangeUpdatedByServer(newRange) {
    this.setState({ rangeMin: newRange[0], rangeMax: newRange[1] });
    getOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name,
                  this.loadOpacityPoints);
  },

  opacityPointsUpdated(controlPoints, envelope) {
    this.setState({ points: controlPoints });
    const min = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const max = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    // clone call necessary to confuse style checker/syntax parser collision
    const scaledPoints = controlPoints.map(pt => clone({ x: min + pt.x * (max - min), y: pt.y }));
    updateOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name, scaledPoints);
  },

  minimumRangeUpdated(e) {
    const rangeMin = parseFloat(e.target.value);
    this.setState({ rangeMin });
    setColorMapRange(this.props.dataset.data.arrays[this.state.currentArray].name,
                     [rangeMin, this.state.rangeMax]);
  },

  maximumRangeUpdated(e) {
    const rangeMax = parseFloat(e.target.value);
    this.setState({ rangeMax });
    setColorMapRange(this.props.dataset.data.arrays[this.state.currentArray].name,
                     [this.state.rangeMin, rangeMax]);
  },

  toggleEditColorMap() {
    const editMode = !this.state.editColorMapMode;
    this.setState({ editColorMapMode: editMode });
  },

  toggleEditOpacityMap() {
    const editMode = !this.state.editOpacityMap;
    this.setState({ editOpacityMap: editMode });
  },

  updatePointValue(e) {
    const min = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const max = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    const value = (parseFloat(e.target.value) - min) / (max - min);
    const index = e.target.dataset.index;
    const points = clone(this.state.points);
    points[index].x = value;
    this.editor.setControlPoints(points);
    this.opacityPointsUpdated(points, null);
  },

  updatePointOpacity(e) {
    const value = parseFloat(e.target.value);
    const index = e.target.dataset.index;
    const points = clone(this.state.points);
    points[index].y = value;
    this.editor.setControlPoints(points);
    this.opacityPointsUpdated(points, null);
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
    const controlPoints = [];
    const min = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const max = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    for (let i = 0; i + 1 < points.length; i += 2) {
      controlPoints.push({ x: (points[i] - min) / (max - min), y: points[i + 1] });
    }
    this.editor.setControlPoints(controlPoints);
    this.setState({ points: controlPoints });
  },

  loadColorMap(preset, range) {
    let presetIndex = 0;
    for (let i = 0; i < colorMaps.length; ++i) {
      if (preset === colorMaps[i].name) {
        presetIndex = i;
        break;
      }
    }
    const newState = { currentColorMap: presetIndex, rangeMin: range[0], rangeMax: range[1] };
    this.setState(newState);
    getOpacityMap(this.props.dataset.data.arrays[this.state.currentArray].name,
                  this.loadOpacityPoints);
  },

  changeColorMap(e) {
    const index = parseInt(e.target.dataset.index, 10);
    setColorMapPreset(this.props.dataset.data.arrays[this.state.currentArray].name,
                      colorMaps[index].name);
    this.setState({ currentColorMap: index });
  },

  render() {
    const rangeMin = this.props.dataset.data.arrays[this.state.currentArray].range[0];
    const rangeMax = this.props.dataset.data.arrays[this.state.currentArray].range[1];
    const colorMapsToShow = this.state.editColorMapMode ?
      colorMaps : [colorMaps[this.state.currentColorMap]];
    const cmapInUse = this.state.editColorMapMode ? style.usingThisColorMap : style.cmapNotUsed;
    return (
      <div className={ style.container }>
        <div className={ style.colorMapContainer }>
          <div className={ style.arraySelector } >
            <select onChange={ this.updateActiveArray }>
            {
              this.props.dataset.data.arrays.map((array, idx) =>
                <option key={idx} value={ idx }>{array.name}</option>
              )
            }
            </select>
          </div>
          <div className={ style.currentColorMap }>
            <div className={ style.colorMapSelector }>
              {
                colorMapsToShow.map((cmap, idx) =>
                  <div className={ style.colorMapDiv } key={ idx }>
                    <i
                      className={
                        (idx === this.state.currentColorMap) ? cmapInUse : style.cmapNotUsed
                      }
                    />
                    <img
                      className={ style.colorMapImage }
                      src={ cmap.icon }
                      alt={ cmap.label }
                      data-index={ idx }
                      onClick={ this.state.editColorMapMode ? this.changeColorMap : undefined }
                    />
                  </div>
                )
              }
            </div>
            <i className={ style.editButton } onClick={ this.toggleEditColorMap } />
          </div>
          <div className={ style.rangeDiv }>
            <input
              type="number"
              className={ style.rangeInputWidget }
              min={ rangeMin }
              max={ rangeMax }
              onChange={ this.minimumRangeUpdated }
              value={ this.state.rangeMin }
            />
            <input
              type="number"
              className={ style.rangeInputWidget }
              min={ rangeMin }
              max={ rangeMax }
              onChange={ this.maximumRangeUpdated }
              value={ this.state.rangeMax }
            />
          </div>
          <div className={ this.state.editColorMapMode ? style.editColormap : style.hidden }>
            <button onClick={ this.setRangeToDataRange }>Use Current Range</button>
            <button onClick={ this.setRangeToDataRangeOverTime }>Use Range over Time</button>
          </div>
        </div>
        <div className={ style.opacityMapContainer }>
          <canvas ref="canvas" width="400" className={ style.canvas } />
          <div className={ style.opacityMapControls }>
            <i className={ style.editButton } onClick={ this.toggleEditOpacityMap } />
          </div>
          <div className={ this.state.editOpacityMap ? style.editOpacityMap : style.hidden }>
            {
            this.state.points.map((pt, idx) =>
              <div
                key={ idx }
                className={ style.pointDiv }
              >
                <div className={ style.pointContainer }>Data Value:
                  <input
                    type="number"
                    className={ style.opacityPointInput }
                    min={ rangeMin }
                    max={ rangeMax }
                    step="any"
                    value={ pt.x * (rangeMax - rangeMin) + rangeMin }
                    data-index={ idx }
                    onChange={ this.updatePointValue }
                  />
                </div>
                <div className={ style.pointContainer }>Alpha:
                  <input
                    type="number"
                    className={ style.opacityPointInput }
                    min={ 0 }
                    max={ 1.0 }
                    step="any"
                    value={ pt.y }
                    data-index={ idx }
                    onChange={ this.updatePointOpacity }
                  />
                </div>
              </div>
            )
            }
          </div>
        </div>
      </div>
    );
  },
});
