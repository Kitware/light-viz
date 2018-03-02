import React from 'react';
import PropTypes from 'prop-types';

import ViewDataset from '../ViewDataset';
import ViewDataset2 from '../ViewDataset2';

import {
  loadConfiguration,
  addConfigObserver,
  getActiveProfile,
} from '../../config';

export default class ViewSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
    };

    this.configUpdated = this.configUpdated.bind(this);
  }

  componentWillMount() {
    this.setState({
      profile: getActiveProfile(),
    });
    addConfigObserver(this);
    loadConfiguration();
  }

  configUpdated() {
    this.setState({ profile: getActiveProfile() });
  }

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
  }
}

ViewSelector.propTypes = {
  location: PropTypes.object,
  params: PropTypes.object,
};

ViewSelector.defaultProps = {
  location: undefined,
  params: undefined,
};
