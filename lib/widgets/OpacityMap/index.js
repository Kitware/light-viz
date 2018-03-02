import React from 'react';
import PropTypes from 'prop-types';

import LinearPieceWiseEditor from 'paraviewweb/src/NativeUI/Canvas/LinearPieceWiseEditor';

import style from 'LightVizStyle/OpacityMapWidget.mcss';

import TogglePanel from '../TogglePanel';
import { updateOpacityMap } from '../../client';

export default class OpacityMap extends React.Component {
  constructor(props) {
    super(props);
    this.onEditorUpdated = this.onEditorUpdated.bind(this);
  }

  componentDidMount() {
    this.editor = new LinearPieceWiseEditor(this.container);
    this.editor.onChange(this.onEditorUpdated);
    this.editor.render();
  }

  onEditorUpdated(controlPoints, envelope) {
    updateOpacityMap(controlPoints);
  }

  render() {
    return (
      <div>
        <TogglePanel
          anchor={['bottom', 'right']}
          classIcon={style.opacityToolbarIcon}
          className={this.props.className}
          independentVisibilityPanels={this.props.freePanels}
          location={this.props.location}
          position={['top-shift', 'right']}
          size={{ button: ['2em', '2em'], panel: [null] }}
          panelId="opacity"
        >
          <div className={style.popupDiv}>
            <canvas
              ref={(c) => {
                this.container = c;
              }}
              className={style.canvas}
            />
          </div>
        </TogglePanel>
      </div>
    );
  }
}

OpacityMap.propTypes = {
  className: PropTypes.string,
  freePanels: PropTypes.array,
  location: PropTypes.object,
};

OpacityMap.defaultProps = {
  className: '',
  freePanels: undefined,
  location: undefined,
};
