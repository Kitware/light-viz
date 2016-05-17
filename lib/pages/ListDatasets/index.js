import React from 'react';
import lightVizClient from '../../client';
import ThumbnailList from './ThumbnailList';

import style from 'LightVizStyle/ListDatasets.mcss';

import { loadConfiguration } from '../../config';

export default React.createClass({

  displayName: 'ListDatasets',

  getInitialState() {
    return {
      datasets: [],
    };
  },

  componentDidMount() {
    this.refresh();
    loadConfiguration();
  },

  refresh() {
    lightVizClient.listDatasets(datasets => this.setState({
      datasets,
    }));
  },

  render() {
    return (
      <div className={style.container}>
        <div className={style.titleBar}>
          <div className={style.titleLeft}>
            LightViz Datasets
          </div>
          <div className={style.titleRight}>
            <i className={style.refreshButton} onClick={ this.refresh } />
          </div>
        </div>
        <div className={style.content}>
          <ThumbnailList list={ this.state.datasets } />
        </div>
      </div>
    );
  },
});
