import React        from 'react';
import VtkRenderer  from 'tonic-ui/lib/react/renderer/VtkRenderer';
import { Link }     from 'react-router';
import lightVizClient from '../../client';
import ClipPanel from '../../panels/Clip';
import TogglePanel from 'tonic-ui/lib/react/widget/TogglePanel';

export default React.createClass({

    displayName: 'ViewDataset',

    getInitialState() {
        return {
            time: 0,
            opacity: 100,
            dataset: { data: { arrays: [], time: []}},
        };
    },

    updateOpacity(event) {
        this.setState({opacity: event.target.value});
        lightVizClient.updateDatasetOpacity(Number(event.target.value)/100.0)
    },

    updateColorBy(event) {
        lightVizClient.updateColor(event.target.value);
    },

    updateTime(event) {
        const time = Number(event.target.value);
        this.setState({time});
        lightVizClient.updateTime(time);
    },

    render() {
        lightVizClient.loadDataset(this.props.params.datasetId, dataset => this.setState({dataset}));
        /* eslint-disable */
        return (<div style={{ position: 'absolute', width: '100%', height: '100%' }} >
                    <Link to='/list'>LightViz</Link>
                    <input type='range' min='0' max='100' value={ this.state.opacity } onChange={ this.updateOpacity }/>
                    <select onChange={ this.updateColorBy }>
                        <option key='__SOLID__' value='__SOLID'>Solid color</option>
                        {  this.state.dataset.data.arrays.map(array => {
                            return <option key={array.name} value={array.name}>{array.label}</option>
                        })}
                    </select>
                    <input type='range' min='0' max={ this.state.dataset.data.time.length - 1 } value={ this.state.time } onChange={ this.updateTime }/>
                    <TogglePanel anchor={['bottom', 'right']} position={['top', 'right']}>
                        <ClipPanel/>
                    </TogglePanel>
                    <VtkRenderer connection={ lightVizClient.getConnection() } client={ lightVizClient.getClient() }/>
                </div>);
        /* eslint-enable */
    },
});
