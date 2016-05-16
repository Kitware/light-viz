import React from 'react';

import { colorMaps } from '../../widgets/ColorMap';
import {
  setColorMap,
  updateOpacityMap,
} from '../../client';

import LinearPieceWiseEditor from 'paraviewweb/src/NativeUI/Canvas/LinearPieceWiseEditor';

import style from 'LightVizStyle/ColorControls.mcss';

export default React.createClass({

  displayName: 'ColorControlsPanel',

  propTypes: {
    dataset: React.PropTypes.object,
  },

  getInitialState() {
    return {
      activeColorMap: 0,
    };
  },

  componentDidMount() {
    const container = this.refs.canvas;
    this.editor = new LinearPieceWiseEditor(container);

    this.editor.onChange(this.onEditorUpdated);

    this.editor.render();
  },

  onEditorUpdated(controlPoints, envelope) {
    updateOpacityMap(controlPoints);
  },

  updateColorMap(event) {
    let colorMap;
    let index;
    for (let i = 0; i < colorMaps.length; ++i) {
      if (colorMaps[i].label === event.target.alt) {
        colorMap = colorMaps[i];
        index = i;
      }
    }
    setColorMap(colorMap.name);
    this.setState({ activeColorMap: index });
  },

  render() {
    return (
      <div className={ style.colorControls }>
        <div className={ style.colorControlsHeader }>
          <span className={ style.title }>Color Map</span>
        </div>
        <div className={ style.controls }>
        {
          colorMaps.map(cmap =>
            <div className={style.line} key={ cmap.name }>
              <img
                className={style.image}
                src={ cmap.icon }
                onClick={ this.updateColorMap }
                alt={ cmap.label }
              />
            </div>
          )
        }
          <div className={ style.popupDiv }>
            <canvas ref="canvas" className={ style.canvas } />
          </div>
        </div>
      </div>
    );
  },
});
