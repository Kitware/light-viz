import React from 'react';

import AbstractPanel from '../AbstractPanel';
import { getState } from '../../client';

export default React.createClass({

  displayName: 'VolumePanel',

  propTypes: {
    dataset: React.PropTypes.object,
    hideAdditionalControls: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      hideAdditionalControls: false,
    };
  },

  componentDidMount() {
    getState('volume', this.refs.modulePanel);
  },

  render() {
    return (
      <AbstractPanel
        ref="modulePanel"
        allowVolumeRepresentation
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        moduleName="Volume"
        representationsToUse={[]}
        name="volume"
        noSolid
      />
    );
  },
});

