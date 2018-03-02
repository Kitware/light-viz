import clone from 'mout/src/lang/clone';
import intersection from 'mout/src/array/intersection';
import SvgIcon from 'paraviewweb/src/React/Widgets/SvgIconWidget';

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router';

import style from 'LightVizStyle/TogglePanel.mcss';

function isPanelVisible(query, panelName) {
  if (query && query.visible) {
    return query.visible.split('|').indexOf(panelName) !== -1;
  }
  return false;
}

export default function TogglePanel(props) {
  let button;
  const { pathname } = props.location;
  const query = clone(props.location.query);
  const panelVisible = isPanelVisible(query, props.panelId);
  query.visible = query.visible || '';
  const visiblePanels = query.visible.split('|');
  const visibleIndependentPanels = intersection(
    visiblePanels,
    props.independentVisibilityPanels
  );
  const buttonAnchor = props.anchor.join(' ');
  const panelAnchor = props.position.join(' ');

  const buttonClass = panelVisible ? style.link : style.linkInactive;

  /*
     * If this panel can be independently visible, add or remove it from the query string
     */
  if (props.independentVisibilityPanels.indexOf(props.panelId) !== -1) {
    if (!panelVisible) {
      query.visible = [props.panelId].concat(visiblePanels).join('|');
    } else {
      visiblePanels.splice(visiblePanels.indexOf(props.panelId), 1);
      query.visible = visiblePanels.join('|');
    }
  } else {
    /*
       * Otherwise add it and remove anything else that is not independant
       */
    query.visible = !panelVisible
      ? [props.panelId].concat(visibleIndependentPanels).join('|')
      : visibleIndependentPanels.join('|');
  }
  if (props.classIcon) {
    button = (
      <i
        className={[props.classIcon, buttonClass].join(' ')}
        style={{
          width: props.size.button[0],
          height: props.size.button[1],
          lineHeight: props.size.button[1],
        }}
        onClick={this.togglePanel}
      />
    );
  } else if (props.svg) {
    button = (
      <SvgIcon
        className={buttonClass}
        width={props.size.button[0]}
        height={props.size.button[1]}
        style={{
          lineHeight: props.size.button[1],
        }}
        icon={props.svg}
        onClick={this.togglePanel}
      />
    );
  } else if (props.icon) {
    button = (
      <img
        src={props.icon}
        alt="Icon"
        className={buttonClass}
        style={{
          width: props.size.button[0],
          height: props.size.button[1],
        }}
        onClick={this.togglePanel}
      />
    );
  } else {
    const myStyle = clone(props.divStyle);
    myStyle.width = props.size.button[0];
    myStyle.height = props.size.button[1];
    button = (
      <div className={buttonClass} style={myStyle} onClick={this.togglePanel} />
    );
  }
  const rootElementClass = props.hidden
    ? style.togglePanelHidden
    : style.togglePanel;
  return (
    <div
      className={[rootElementClass, props.className].join(' ')}
      style={{
        width: props.size.button[0],
        height: props.size.button[1],
      }}
    >
      <Link to={{ pathname, query }}>{button}</Link>
      <div className={[style.button, buttonAnchor].join(' ')}>
        <div
          className={[style.content, panelAnchor].join(' ')}
          style={{ display: panelVisible ? 'block' : 'none' }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}

TogglePanel.propTypes = {
  anchor: PropTypes.array,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  classIcon: PropTypes.string,
  className: PropTypes.string,
  divStyle: PropTypes.object,
  hidden: PropTypes.bool,
  icon: PropTypes.string,
  svg: PropTypes.string,
  independentVisibilityPanels: PropTypes.array,
  location: PropTypes.object,
  panelId: PropTypes.string,
  position: PropTypes.array,
  size: PropTypes.object,
};

TogglePanel.defaultProps = {
  anchor: ['top', 'right'],
  children: [],
  classIcon: null,
  hidden: false,
  icon: null,
  svg: null,
  independentVisibilityPanels: [],
  panelId: '',
  position: ['top', 'left'],
  size: {
    button: ['2em', '2em'],
  },

  className: '',
  divStyle: undefined,
  location: undefined,
};
