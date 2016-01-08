import Module      from '../../panels/Module';
import modules     from '../../modules';
import React       from 'react';
import TimePanel   from '../../panels/Time';
import TogglePanel from '../../widgets/TogglePanel';
import VtkRenderer from 'tonic-ui/lib/react/renderer/VtkRenderer';
import { Link }    from 'react-router';

import {
    resetCamera,
    loadDataset,
    getConnection,
    getClient,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'ViewDataset',

    propTypes: {
        location: React.PropTypes.object,
        params: React.PropTypes.object,
    },

    getInitialState() {
        return {
            time: 0,
            dataset: { data: { arrays: [], time: [], bounds: [0,1,0,1,0,1]}},
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
                      { modules.map( panel => {
                        return <Module key={ panel.name } panel={ panel } { ...this.props } dataset={ this.state.dataset } freePanels={['time']}/>
                      })};
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
