import React from 'react';

import ViewDataset from '../ViewDataset';
import ViewDataset2 from '../ViewDataset2';

import {
  loadConfiguration,
  addConfigObserver,
  getActiveProfile,
} from '../../config';

export default React.createClass({
  displayName: 'ViewSelector',

  propTypes: {
    location: React.PropTypes.object,
    params: React.PropTypes.object,
  },

  getInitialState() {
    return {
      profile: null,
    };
  },

  componentWillMount() {
    this.setState({
      profile: getActiveProfile(),
    });
    addConfigObserver(this);
    loadConfiguration();
  },

  configUpdated() {
    this.setState({ profile: getActiveProfile() });
  },

  render() {
    let view = null;
    if (this.state.profile.viewType === 1) {
      view = (
        <ViewDataset
          location={this.props.location}
          params={this.props.params}
          profile={this.state.profile}
        />
      );
    } else if (this.state.profile.viewType === 2) {
      view = (
        <ViewDataset2
          location={this.props.location}
          params={this.props.params}
          profile={this.state.profile}
        />
      );
    }
    return view;
  },
});
