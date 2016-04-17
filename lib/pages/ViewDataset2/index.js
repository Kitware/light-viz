import Section from '../../panels/Section';
import modules from '../../modules';
import React from 'react';
import TimePanel from '../../panels/Time';
import ColorControls from '../../panels/ColorControls';
import VtkRenderer from 'paraviewweb/src/React/Renderers/VtkRenderer';

import {
  resetCamera,
  loadDataset,
  getConnection,
  getClient,
  saveThumbnail,
}
from '../../client';

import style from 'LightVizStyle/ViewDataset2.mcss';

export default React.createClass({

  displayName: 'ViewDataset2',

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
      showControls: false,
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

  toggleShowControls(e) {
    const show = !this.state.showControls;
    this.setState({ showControls: show });
  },

  render() {
    const hideTimeControls = this.state.dataset.data.time.length === 0;

    const controlPanelClass = this.state.showControls ?
      style.controlPanel : style.controlPanelHidden;
    const controlsClass = this.state.showControls ? style.controls : style.controlsHidden;
    const controlPanelToggleClass = this.state.showControls ?
      style.hideControlsIcon : style.showControlsIcon;

    const colorControlsDiv = (
      <ColorControls dataset={ this.state.dataset } />
    );

    return (
      <div className={ style.viewDataset }>
        <div className={ controlPanelClass }>
          <div className={ style.showControlsIconDiv }>
            <i className={ style.resetViewButton } onClick={ resetCamera }></i>
            <i className={ style.addThumbnailButton } onClick={ this.querySaveThumbnail }></i>
            <i className={ controlPanelToggleClass } onClick={ this.toggleShowControls } />
          </div>
          <div className={ controlsClass }>
            { colorControlsDiv }
            <Section
              hidden={ hideTimeControls }
              content={
                <TimePanel
                  location={ this.props.location }
                  params={ this.props.params }
                  dataset={this.state.dataset}
                />
              }
              { ...this.props }
              dataset={ this.state.dataset }
            />
            { modules.map(panel =>
              <Section
                className={ style.section }
                key={ panel.name }
                panel={ panel }
                { ...this.props }
                dataset={ this.state.dataset }
              />
            )}
          </div>
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
