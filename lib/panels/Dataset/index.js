import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import AbstractPanel        from '../AbstractPanel';

import {
    updateDatasetOpacity,
    getState,
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

    componentDidMount() {
      getState('dataset', this, this._modulePanel);
    },

    updateState(newState) {
      this.setState({ opacity: newState.opacity });
    },

    updateOpacity(name, value) {
        this.setState({opacity: value});
        updateDatasetOpacity(value);
    },

    render() {
        return (<AbstractPanel ref={(c) => { this._modulePanel = c}}
                             name='dataset'
                             dataset={this.props.dataset}
                             hideInputSelection
                             moduleName='Dataset'
                             enabledDefault>
                  <div className='DatasetPanelContents'>
                    <i className='fa fa-sun-o' />
                    <DoubleSliderElement
                       min='0'
                       max='1'
                       value={ this.state.opacity }
                       onChange={ this.updateOpacity }/>
                  </div>
                </AbstractPanel>);
    },
});
