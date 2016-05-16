import React from 'react';
import TogglePanel from '../TogglePanel';

import { updateOpacityMap } from '../../client';

import LinearPieceWiseEditor from 'paraviewweb/src/NativeUI/Canvas/LinearPieceWiseEditor';

import style from 'LightVizStyle/OpacityMapWidget.mcss';

export default React.createClass({
  displayName: 'OpacityMap',

  propTypes: {
    className: React.PropTypes.string,
    freePanels: React.PropTypes.array,
    location: React.PropTypes.object,
  },

  getDefaultProps() {
    return {};
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

  render() {
    return (
      <div>
        <TogglePanel
          anchor={['bottom', 'right']}
          classIcon={ style.opacityToolbarIcon }
          className={ this.props.className }
          independentVisibilityPanels={this.props.freePanels}
          location={this.props.location}
          position={['top-shift', 'right']}
          size={{ button: ['2em', '2em'], panel: [null] }}
          panelId="opacity"
        >
          <div className={ style.popupDiv }>
            <canvas ref="canvas" className={ style.canvas } />
          </div>
        </TogglePanel>
      </div>
    );
  },
});
