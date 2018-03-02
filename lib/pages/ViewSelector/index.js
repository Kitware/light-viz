import React from 'react';

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
      view = <ViewDataset {...this.props} profile={this.state.profile} />;
    } else if (this.state.profile.viewType === 2) {
      view = <ViewDataset2 {...this.props} profile={this.state.profile} />;
    }
    return view;
  }
}
