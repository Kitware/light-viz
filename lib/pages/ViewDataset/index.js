import React            from 'react';
import VtkRenderer      from 'tonic-ui/lib/react/renderer/VtkRenderer';
import { Link }         from 'react-router';
import ClipPanel        from '../../panels/Clip';
import ContourPanel     from '../../panels/Contour';
import TogglePanel      from 'tonic-ui/lib/react/widget/TogglePanel';
import ColorBy          from '../../widgets/ColorBy';
import Representation   from '../../widgets/Representation';

import {
    updateColor,
    resetCamera,
    updateRepresentation,
    updateDatasetOpacity,
    updateTime,
    loadDataset,
    getConnection,
    getClient,
} from '../../client';

export default React.createClass({

    displayName: 'ViewDataset',

    propTypes: {
        params: React.PropTypes.object,
    },

    getInitialState() {
        return {
            time: 0,
            opacity: 100,
            dataset: { data: { arrays: [], time: []}},
        };
    },

    updateOpacity(event) {
        this.setState({opacity: event.target.value});
        updateDatasetOpacity(Number(event.target.value)/100.0)
    },

    updateTime(event) {
        const time = Number(event.target.value);
        this.setState({time});
        updateTime(time);
    },

    render() {
        loadDataset(this.props.params.datasetId, dataset => this.setState({dataset}));
        /* eslint-disable */
        return (<div style={{ position: 'absolute', width: '100%', height: '100%' }} >
                    <Link to='/list'>LightViz</Link>
                    <input type='range' min='0' max='100' value={ this.state.opacity } onChange={ this.updateOpacity }/>
                    <ColorBy dataset={ this.state.dataset } name='dataset' onChange={ updateColor }/>
                    <Representation name='dataset' onChange={ updateRepresentation } />
                    <input type='range' min='0' max={ this.state.dataset.data.time.length - 1 } value={ this.state.time } onChange={ this.updateTime }/>
                    <i className='fa fa-arrows-alt' onClick={ resetCamera }></i>

                    <TogglePanel anchor={['bottom', 'right']} position={['top', 'right']}>
                        <ClipPanel dataset={this.state.dataset} bounds={ this.state.dataset.data.bounds }/>
                    </TogglePanel>

                    <TogglePanel anchor={['bottom', 'right']} position={['top', 'right']}>
                        <ContourPanel dataset={this.state.dataset} />
                    </TogglePanel>

                    <VtkRenderer connection={ getConnection() } client={ getClient() }/>
                </div>);
        /* eslint-enable */
    },
});
