import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import ModulePanel          from '../ModulePanel';

import {
    updateDatasetOpacity,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'DatasetPanel',

    propTypes: {
        dataset: React.PropTypes.object,
    },

    getInitialState() {
      return {
            opacity: 1,
      };
    },

    updateOpacity(name, value) {
        this.setState({opacity: value});
        updateDatasetOpacity(value);
    },

    render() {
        return (<ModulePanel name='dataset' dataset={this.props.dataset} moduleName='Dataset' enabledDefault>
                  <div className='DatasetPanelContents'>
                    <i className='fa fa-sun-o' />
                    <DoubleSliderElement
                       min='0'
                       max='1'
                       value={ this.state.opacity }
                       onChange={ this.updateOpacity }/>
                  </div>
                </ModulePanel>);
    },
});
