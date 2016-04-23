import React from 'react';

import AbstractPanel from '../AbstractPanel';

const volumeImage = require('./volume.png');

const representation = [{
  img: volumeImage,
  representation: 'Volume',
}];

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

  render() {
    return (
      <AbstractPanel
        ref="modulePanel"
        allowVolumeRepresentation
        dataset={this.props.dataset}
        hideAllButVisibility={ this.props.hideAdditionalControls }
        moduleName="Volume"
        name="volume"
        noSolid
        representationsToUse={ representation }
      />
    );
  },
});

