import React            from 'react';
import VtkRenderer      from 'tonic-ui/lib/react/renderer/VtkRenderer';
import { Link }         from 'react-router';
import lightVizClient   from '../../client';
import ClipPanel        from '../../panels/Clip';
import TogglePanel      from 'tonic-ui/lib/react/widget/TogglePanel';
import ColorBy          from '../../widgets/ColorBy';
import Representation   from '../../widgets/Representation';

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

    updateColorBy(name, field) {
        lightVizClient.updateColor(field);
    },

    updateRepresentation(name, rep) {
        lightVizClient.updateRepresentation(name, rep);
    },

    updateTime(event) {
        const time = Number(event.target.value);
        this.setState({time});
        lightVizClient.updateTime(time);
    },

    resetCamera() {
        lightVizClient.resetCamera();
    },

    render() {
        lightVizClient.loadDataset(this.props.params.datasetId, dataset => this.setState({dataset}));
        /* eslint-disable */
        return (<div style={{ position: 'absolute', width: '100%', height: '100%' }} >
                    <Link to='/list'>LightViz</Link>
                    <input type='range' min='0' max='100' value={ this.state.opacity } onChange={ this.updateOpacity }/>
                    <ColorBy dataset={ this.state.dataset } name='dataset' onChange={ this.updateColorBy }/>
                    <Representation name='dataset' onChange={ this.updateRepresentation } />
                    <input type='range' min='0' max={ this.state.dataset.data.time.length - 1 } value={ this.state.time } onChange={ this.updateTime }/>
                    <i className='fa fa-arrows-alt' onClick={ this.resetCamera }></i>
                    <TogglePanel anchor={['bottom', 'right']} position={['top', 'right']}>
                        <ClipPanel dataset={this.state.dataset} />
                    </TogglePanel>
                    <VtkRenderer connection={ lightVizClient.getConnection() } client={ lightVizClient.getClient() }/>
                </div>);
        /* eslint-enable */
    },
});
