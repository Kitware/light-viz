import clone from 'mout/src/lang/clone';
import intersection from 'mout/src/array/intersection';
import React from 'react';
import {
  Link,
}
from 'react-router';

import style from 'LightVizStyle/TogglePanel.mcss';

function isPanelVisible(query, panelName) {
  if (query && query.visible) {
    return query.visible.split('|').indexOf(panelName) !== -1;
  }
  return false;
}


export default React.createClass({

  displayName: 'TogglePanel',

  propTypes: {
    anchor: React.PropTypes.array,
    children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    classIcon: React.PropTypes.string,
    className: React.PropTypes.string,
    divStyle: React.PropTypes.object,
    hidden: React.PropTypes.bool,
    icon: React.PropTypes.string,
    independentVisibilityPanels: React.PropTypes.array,
    location: React.PropTypes.object,
    panelId: React.PropTypes.string,
    position: React.PropTypes.array,
    size: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      anchor: ['top', 'right'],
      children: [],
      classIcon: null,
      hidden: false,
      icon: null,
      independentVisibilityPanels: [],
      panelId: '',
      position: ['top', 'left'],
      size: {
        button: ['2em', '2em'],
      },
    };
  },

  render() {
    let button = undefined;
    const { pathname } = this.props.location;
    const query = clone(this.props.location.query);
    const panelVisible = isPanelVisible(query, this.props.panelId);
    query.visible = query.visible || '';
    const visiblePanels = query.visible.split('|');
    const visibleIndependentPanels = intersection(visiblePanels,
                        this.props.independentVisibilityPanels);
    const buttonAnchor = this.props.anchor.join(' ');
    const panelAnchor = this.props.position.join(' ');

    const buttonClass = panelVisible ? style.link : style.linkInactive;

    /*
     * If this panel can be independently visible, add or remove it from the query string
     */
    if (this.props.independentVisibilityPanels.indexOf(this.props.panelId) !== -1) {
      if (!panelVisible) {
        query.visible = [this.props.panelId].concat(visiblePanels).join('|');
      } else {
        visiblePanels.splice(visiblePanels.indexOf(this.props.panelId), 1);
        query.visible = visiblePanels.join('|');
      }
    } else {
      /*
       * Otherwise add it and remove anything else that is not independant
       */
      if (!panelVisible) {
        query.visible =  [this.props.panelId].concat(visibleIndependentPanels).join('|');
      } else {
        query.visible = visibleIndependentPanels.join('|');
      }
    }
    if (this.props.classIcon) {
      button = (
        <i
          className={ [this.props.classIcon, buttonClass].join(' ') }
          style={{
            width: this.props.size.button[0],
            height: this.props.size.button[1],
            lineHeight: this.props.size.button[1],
          }}
          onClick={ this.togglePanel }
        />
      );
    } else if (this.props.icon) {
      button = (
        <img
          src={ this.props.icon }
          alt="Icon"
          className={ buttonClass }
          style={{
            width: this.props.size.button[0],
            height: this.props.size.button[1],
          }}
          onClick={ this.togglePanel }
        />
      );
    } else {
      const myStyle = clone(this.props.divStyle);
      myStyle.width = this.props.size.button[0];
      myStyle.height = this.props.size.button[1];
      button = (
        <div
          className={ buttonClass }
          style={ myStyle }
          onClick={ this.togglePanel }
        />
      );
    }
    const rootElementClass = this.props.hidden ? style.togglePanelHidden : style.togglePanel;
    return (
      <div
        className={ [rootElementClass, this.props.className].join(' ') }
        style={{
          width: this.props.size.button[0],
          height: this.props.size.button[1],
        }}
      >
        <Link to={{ pathname, query }}>
          { button }
        </Link>
        <div className={ [style.button, buttonAnchor].join(' ') }>
          <div
            className={ [style.content, panelAnchor].join(' ') }
            style={{ display: panelVisible ? 'block' : 'none' }}
          >
            { this.props.children }
          </div>
        </div>
      </div>
    );
  },
});
