import React       from 'react';
import { Link }    from 'react-router';
import VtkRenderer from 'tonic-ui/lib/react/renderer/VtkRenderer';

export default React.createClass({

    displayName: 'ViewDataset',

    render() {
        return (<div style={{ position: 'absolute', width: '100%', height: '100%' }} >
                    <VtkRenderer connection={ LightViz.connection } client={ LightViz.client }/>
                </div>);
    }
});
