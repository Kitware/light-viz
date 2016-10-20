/* global window */
import clone from 'mout/src/lang/clone';
import React from 'react';
import VtkRenderer from 'paraviewweb/src/React/Renderers/VtkRenderer';
import paletteIcon from 'paraviewweb/svg/colors/Palette.svg';

import style from 'LightVizStyle/ViewDataset.mcss';

import Module from '../../panels/Module';
import modules from '../../modules';

import TimePanel from '../../panels/Time';
import TogglePanel from '../../widgets/TogglePanel';
import ColorMap from '../../widgets/ColorMap';
import lightVizIcon from '../../../svg/LightViz.svg';

import {
  resetCamera, loadDataset, getConnection, getClient,
  saveThumbnail, setForegroundColor, setBackgroundColor,
} from '../../client';

const colors = [{
  label: 'White',
  pvcolor: '1 1 1',
  pvbgcolor: '0 0 0',
  cssColor: [255, 255, 255],
  cssBGColor: [0, 0, 0],
}, {
  label: 'Red',
  pvcolor: '.8 .2 .2',
  pvbgcolor: '.3 .3 .3',
  cssColor: [204, 51, 51],
  cssBGColor: [77, 77, 77],
}, {
  label: 'Green',
  pvcolor: '.2 .8 .2',
  pvbgcolor: '.4 .2 .2',
  cssColor: [51, 204, 51],
  cssBGColor: [102, 51, 51],
}];

function updateColors(e) {
  const idx = e.target.dataset.index;
  const scheme = colors[idx];
  setForegroundColor(scheme.pvcolor);
  setBackgroundColor(scheme.pvbgcolor);
  this.setState({
    foreground: scheme.cssColor,
    activeIndex: idx,
    background: scheme.cssBGColor,
  });
}

export default React.createClass({

  displayName: 'ViewDataset',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    profile: React.PropTypes.object,
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      time: 0,
      dataset: {
        data: {
          arrays: [{ range: [0, 100] }],
          time: [],
          bounds: [0, 1, 0, 1, 0, 1],
        },
        autoApply: false,
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

  listDataSets() {
    this.context.router.push('/list');
  },

  toggleAutoApply() {
    const newAA = !this.state.dataset.autoApply;
    const newDataset = clone(this.state.dataset);
    newDataset.autoApply = newAA;
    this.setState({ dataset: newDataset });
  },

  render() {
    const hideTimeControls = this.state.dataset.data.time.length === 0;
    const independentPanels = ['time', 'fgbg', 'opacity', 'LightViz'];

    const newModules = modules.filter((mdl) => {
      if (this.props.profile.modules_included.includes(mdl.name)) {
        return true;
      }
      if (this.props.profile.modules_included.length === 0 &&
        !this.props.profile.modules_excluded.includes(mdl.name)) {
        return true;
      }
      return false;
    });

    return (
      <div className={style.viewDataset}>
        <div className={style.listDataSetsButtonDiv}>
          <i className={style.listDataSetsButton} onClick={this.listDataSets} />
        </div>
        <div className={style.leftSidebar}>
          <TogglePanel
            anchor={['top', 'right']}
            svg={lightVizIcon}
            className={style.module}
            hidden={false}
            independentVisibilityPanels={independentPanels}
            location={this.props.location}
            position={['top', 'left-shift']}
            size={{ button: ['2em', '2em'], panel: [null] }}
            panelId="LightViz"
          >
            <div className={style.lightVizPanel}>
              <i className={style.resetViewButton} onClick={resetCamera} />
              <i className={style.addThumbnailButton} onClick={this.querySaveThumbnail} />
              {colors.map((c, idx) => {
                const myfg = c.cssColor.join(',');
                const mybg = c.cssBGColor.join(',');
                const mygradient = `radial-gradient(rgb(${myfg}) 30%, rgb(${mybg}) 45%)`;
                return (
                  <div
                    className={style.colorItem}
                    key={idx}
                    style={{ background: mygradient }}
                    data-index={idx}
                    onClick={updateColors}
                  />
                );
              })}
              <div
                className={style.toggleAutoApplyDiv}
                onClick={this.toggleAutoApply}
              >
                <i className={this.state.dataset.autoApply ? style.autoApplyOnIcon : style.autoApplyOffIcon} />
                Auto-Apply
              </div>
            </div>
          </TogglePanel>
          <TogglePanel
            anchor={['top', 'right']}
            svg={paletteIcon}
            className={style.module}
            hidden={false}
            independentVisibilityPanels={independentPanels}
            location={this.props.location}
            position={['top', 'left-shift']}
            size={{ button: ['2em', '2em'], panel: [null] }}
            panelId="ColorMap"
          >
            <div className={style.colorModuleContainer}>
              <ColorMap dataset={this.state.dataset} disableCollapse />
            </div>
          </TogglePanel>
          <div className={style.modules}>
            {newModules.map(panel =>
              <Module
                className={style.module}
                key={panel.name}
                panel={panel}
                {...this.props}
                dataset={this.state.dataset}
                freePanels={independentPanels}
              />
            )}
          </div>
          <TogglePanel
            anchor={['bottom', 'right']}
            classIcon={style.timeIcon}
            className={style.module}
            hidden={hideTimeControls}
            independentVisibilityPanels={independentPanels}
            location={this.props.location}
            position={['bottom', 'left-shift']}
            size={{ button: ['2em', '2em'], panel: [null] }}
            panelId="time"
          >
            <div className={style.timeModule}>
              <TimePanel
                location={this.props.location}
                params={this.props.params}
                dataset={this.state.dataset}
              />
            </div>
          </TogglePanel>
        </div>
        <VtkRenderer
          className={style.vtkRenderer}
          connection={getConnection()}
          client={getClient()}
        />
      </div>
    );
  },
});
