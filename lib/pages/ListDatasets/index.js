import React from 'react';
import lightVizClient from '../../client';
import ThumbnailList from './ThumbnailList';
import lightVizIcon from '../../../svg/LightViz.svg';
import SvgIcon from 'paraviewweb/src/React/Widgets/SvgIconWidget';

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
        <div className={style.toolbar}>
          <SvgIcon icon={lightVizIcon} width="25px" height="25px" />
          <i className={style.refreshButton} onClick={ this.refresh } />
        </div>
        <div className={style.content}>
          <ThumbnailList list={ this.state.datasets } />
        </div>
      </div>
    );
  },
});
