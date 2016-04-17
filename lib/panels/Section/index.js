import React from 'react';

import style from 'LightVizStyle/Section.mcss';

export default React.createClass({

  displayName: 'SectionContainer',

  propTypes: {
    dataset: React.PropTypes.object,
    hidden: React.PropTypes.bool,
    panel: React.PropTypes.object,
    content: React.PropTypes.object,
  },

  getInitialState() {
    return {
      hidden: false,
      showing: false,
    };
  },

  toggleShown() {
    const showing = ! this.state.showing;
    this.setState({ showing });
  },

  render() {
    const panelClass = this.state.showing ? style.shown : style.hidden;
    const iconClass = this.state.showing ? style.shownIcon : style.hiddenIcon;
    const sectionClass = this.props.hidden ? style.sectionHidden : style.section;
    const content = this.props.panel ?
      React.createElement(this.props.panel.component, this.props) :
      this.props.content;
    return (
      <div className={ sectionClass }>
        <div className={ style.panelHeader }>
          <i className={ iconClass } onClick={ this.toggleShown } />
        </div>
        <div className={ panelClass }>
          { content }
        </div>
      </div>
    );
  },
});
