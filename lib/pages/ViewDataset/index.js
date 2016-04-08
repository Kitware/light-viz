import Module from '../../panels/Module';
import modules from '../../modules';
import React from 'react';
import TimePanel from '../../panels/Time';
import TogglePanel from '../../widgets/TogglePanel';
import ColorMap from '../../widgets/ColorMap';
import FGBG from '../../widgets/FGBG';
import OpacityMap from '../../widgets/OpacityMap';
import VtkRenderer from 'paraviewweb/src/React/Renderers/VtkRenderer';
import {
  Link,
}
from 'react-router';

import {
  resetCamera,
  loadDataset,
  getConnection,
  getClient,
  saveThumbnail,
  setColorMap,
}
from '../../client';

import style from 'LightVizStyle/ViewDataset.mcss';

export default React.createClass({

  displayName: 'ViewDataset',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
  },

  getInitialState() {
    return {
      time: 0,
      dataset: {
        data: {
          arrays: [],
          time: [],
          bounds: [0, 1, 0, 1, 0, 1],
        },
      },
      datasetId: null,
    };
  },

  componentWillMount() {
    this.setState({
      datasetId: this.props.params.datasetId,
    });
    loadDataset(this.props.params.datasetId, dataset => this.setState({
      dataset,
    }));
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.datasetId !== this.state.datasetId) {
      this.setState({
        datasetId: nextProps.params.datasetId,
      });
      loadDataset(this.props.params.datasetId, dataset => this.setState({
        dataset,
      }));
    }
  },

  querySaveThumbnail() {
    window.confirm('Add a snapshot of the current view to this dataset\'s thumbnails?\n' +
      'The view will be resized and the camera reset before taking the screenshot.');
    // I'd like to ask the user if they are sure here...
    saveThumbnail();
  },

  render() {
    const hideTimeControls = this.state.dataset.data.time.length === 0;
    const independentPanels = ['time', 'colormap', 'fgbg', 'opacity'];

    return (
      <div className={ style.viewDataset }>
        <div className={ style.titleBar }>
          <Link to="/list">LightViz</Link>
          <div className={ style.colorControls }>
            <i className={ style.resetViewButton } onClick={ resetCamera }></i>
            <i className={ style.addThumbnailButton } onClick={ this.querySaveThumbnail }></i>
            <ColorMap
              className={ style.colorControl }
              freePanels={independentPanels}
              location={ this.props.location }
              onChange={ setColorMap }
            />
            <OpacityMap
              className={ style.opacityToolbarStyle }
              freePanels={independentPanels}
              location={ this.props.location }
            />
            <FGBG
              className={ style.colorControl }
              freePanels={independentPanels}
              location={this.props.location}
            />
          </div>
        </div>
        <div className={ style.leftSidebar }>
          <div className={ style.modules }>
            { modules.map(panel =>
              <Module
                className={ style.module }
                key={ panel.name }
                panel={ panel }
                { ...this.props }
                dataset={ this.state.dataset }
                freePanels={independentPanels}
              />
            )}
          </div>
          <TogglePanel
            anchor={['top', 'right']}
            classIcon={ style.timeIcon }
            className={ style.module }
            hidden={ hideTimeControls }
            independentVisibilityPanels={independentPanels}
            location={ this.props.location }
            position={['top', 'left-shift']}
            size={{ button: ['2em', '2em'], panel: [null] }}
            panelId="time"
          >
            <div className={ style.timeModule }>
              <TimePanel
                location={ this.props.location }
                params={ this.props.params }
                dataset={this.state.dataset}
              />
            </div>
          </TogglePanel>
        </div>
        <VtkRenderer
          className={ style.vtkRenderer }
          connection={ getConnection() }
          client={ getClient() }
        />
      </div>
    );
  },
});
