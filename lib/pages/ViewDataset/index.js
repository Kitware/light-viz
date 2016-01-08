import ClipPanel        from '../../panels/Clip';
import ContourPanel     from '../../panels/Contour';
import DatasetPanel     from '../../panels/Dataset';
import React            from 'react';
import SlicePanel       from '../../panels/Slice';
import TimePanel        from '../../panels/Time';
import TogglePanel      from '../../widgets/TogglePanel';
import VtkRenderer      from 'tonic-ui/lib/react/renderer/VtkRenderer';
import { Link }         from 'react-router';

import {
    resetCamera,
    loadDataset,
    getConnection,
    getClient,
} from '../../client';

require('./style.css');

const datasetImage = require('./dataset.png');
const clipImage = require('./clip.png');
const contourImage = require('./contour.png');
const sliceImage = require('./oslice.png');

export default React.createClass({

    displayName: 'ViewDataset',

    propTypes: {
        location: React.PropTypes.object,
        params: React.PropTypes.object,
    },

    getInitialState() {
        return {
            time: 0,
            dataset: { data: { arrays: [], time: []}},
            datasetId: null,
        };
    },

    componentWillMount() {
      this.setState({datasetId: this.props.params.datasetId});
      loadDataset(this.props.params.datasetId, dataset => this.setState({dataset}));
    },

    componentWillReceiveProps(nextProps) {
      if (nextProps.params.datasetId !== this.state.datasetId) {
        this.setState({datasetId: nextProps.params.datasetId});
        loadDataset(this.props.params.datasetId, dataset => this.setState({dataset}));
      }
    },

    render() {
        const hideTimeControls = this.state.dataset.data.time.length === 0;
        return (<div className="ViewDataset">
                  <div className="ViewDataset_TitleBar">
                    <Link to='/list'>LightViz</Link>
                    <div className="ViewDataset__ColorControls">
                      <i className='fa fa-arrows-alt is-clickable' onClick={ resetCamera }></i>
                    </div>
                  </div>
                  <div className="ViewDataset_LeftSidebar">
                    <div className="ViewDataset__Modules">
                      <TogglePanel anchor={['top', 'right']}
                                   icon= { datasetImage }
                                   independentVisibilityPanels={['time']}
                                   location={ this.props.location }
                                   position={['top', 'left-shift']}
                                   panelId='dataset'>
                        <DatasetPanel dataset={this.state.dataset} />
                      </TogglePanel>
                      <TogglePanel anchor={['top', 'right']}
                                   icon= { clipImage }
                                   independentVisibilityPanels={['time']}
                                   location={ this.props.location }
                                   position={['top', 'left-shift']}
                                   panelId='clip'>
                        <ClipPanel dataset={this.state.dataset} bounds={ this.state.dataset.data.bounds }/>
                      </TogglePanel>
                      <TogglePanel anchor={['top', 'right']}
                                   icon= { contourImage }
                                   independentVisibilityPanels={['time']}
                                   location={ this.props.location }
                                   position={['top', 'left-shift']}
                                   panelId='contour'>
                        <ContourPanel dataset={this.state.dataset}/>
                      </TogglePanel>
                      <TogglePanel anchor={['top', 'right']}
                                   icon= { sliceImage }
                                   independentVisibilityPanels={['time']}
                                   location={ this.props.location }
                                   position={['top', 'left-shift']}
                                   panelId='slice'>
                        <SlicePanel dataset={this.state.dataset} bounds={ this.state.dataset.data.bounds }/>
                      </TogglePanel>
                    </div>
                    <TogglePanel anchor={['top', 'right']}
                                 classIcon='fa fa-clock-o'
                                 hidden={ hideTimeControls }
                                 independentVisibilityPanels={['time']}
                                 location={ this.props.location }
                                 position={['top', 'left-shift']}
                                 size={{'button': ['2em', '2em'], 'panel': [null]}}
                                 panelId='time'>
                      <div className="ViewDataset__TimeModule">
                        <TimePanel location={ this.props.location } params={ this.props.params } dataset={this.state.dataset}/>
                      </div>
                    </TogglePanel>
                  </div>
                  <VtkRenderer connection={ getConnection() } client={ getClient() }/>
                </div>);
    },
});
