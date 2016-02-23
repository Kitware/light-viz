import DoubleSliderElement  from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import React                from 'react';
import AbstractPanel        from '../AbstractPanel';

import {
    updateDatasetOpacity,
    getState,
} from '../../client';

import style from 'LightVizStyle/DatasetPanel.mcss';

export default React.createClass({

    displayName: 'DatasetPanel',

    propTypes: {
        dataset: React.PropTypes.object,
    },

    getInitialState() {
      this.oldOpacity = 1;
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
        if (this.props.dataset.autoApply) {
            updateDatasetOpacity(value);
        }
    },

    onApply() {
        updateDatasetOpacity(this.state.opacity);
        this.oldOpacity = this.state.opacity;
    },

    onReset() {
        this.setState({ opacity: this.oldOpacity});
    },

    needsApply() {
        return this.state.opacity === this.oldOpacity;
    },

    render() {
        return (<AbstractPanel ref={(c) => { this._modulePanel = c}}
                             name='dataset'
                             dataset={this.props.dataset}
                             hideInputSelection
                             moduleName='Dataset'
                             onApply={ this.onApply }
                             onReset={ this.onReset }
                             needsApply={ this.state.opacity !== this.oldOpacity }
                             enabledDefault>
                  <div className={style.contents}>
                    <i className={style.opacityIcon} />
                    <DoubleSliderElement
                       min='0'
                       max='1'
                       value={ this.state.opacity }
                       onChange={ this.updateOpacity }/>
                  </div>
                </AbstractPanel>);
    },
});
