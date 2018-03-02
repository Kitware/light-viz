import React from 'react';
import PropTypes from 'prop-types';

import clone from 'mout/src/lang/clone';

import style from 'LightVizStyle/Section.mcss';

export default class SectionContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: false,
      showing: false,
    };

    this.toggleShown = this.toggleShown.bind(this);
  }

  toggleShown() {
    const showing = !this.state.showing;
    this.setState({ showing });
  }

  render() {
    const panelClass = this.state.showing ? style.shown : style.hidden;
    const iconClass = this.state.showing ? style.shownIcon : style.hiddenIcon;
    const sectionClass = this.props.hidden
      ? style.sectionHidden
      : style.section;
    const propsWithHidden = clone(this.props);
    propsWithHidden.hideAdditionalControls = !this.state.showing;
    const content = this.props.panel
      ? React.createElement(this.props.panel.component, propsWithHidden)
      : this.props.content;
    return (
      <div className={sectionClass}>
        <div className={style.panelHeader}>
          <i className={iconClass} onClick={this.toggleShown} />
        </div>
        <div className={panelClass}>{content}</div>
      </div>
    );
  }
}

SectionContainer.propTypes = {
  dataset: PropTypes.object,
  hidden: PropTypes.bool,
  panel: PropTypes.object,
  content: PropTypes.object,
};

SectionContainer.defaultProps = {
  dataset: undefined,
  hidden: undefined,
  panel: undefined,
  content: undefined,
};
