import clone from 'mout/src/lang/clone';
import intersection from 'mout/src/array/intersection';
import SvgIcon from 'paraviewweb/src/React/Widgets/SvgIconWidget';

import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import style from 'LightVizStyle/TogglePanel.mcss';

function isPanelVisible(query, panelName) {
  if (query && query.visible) {
    return query.visible.split('|').indexOf(panelName) !== -1;
  }
  return false;
}

function togglePanel() {
  // NoOp
}

function searchToQuery(search) {
  const summary = {};
  const queryTokens = (search || '')
    .replace(/#.*/, '') // remove hash query
    .replace('?', '') // Remove ? from the head
    .split('&'); // extract token pair

  queryTokens.forEach((token) => {
    const [key, value] = token.split('=').map((s) => decodeURIComponent(s));
    if (key && value) {
      summary[key] = value;
    }
  });

  return summary;
}

function queryToSearch(query) {
  const search = [];
  const list = Object.keys(query);
  for (let i = 0; i < list.length; i++) {
    search.push([list[i], query[list[i]]].join('='));
  }
  if (search.length) {
    return `?${search.join('&')}`;
  }
  return '';
}

export default function TogglePanel(props) {
  let button;
  const { pathname } = props.location;
  const query = searchToQuery(props.location.search);
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
        onClick={togglePanel}
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
        onClick={togglePanel}
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
        onClick={togglePanel}
      />
    );
  } else {
    const myStyle = clone(props.divStyle);
    myStyle.width = props.size.button[0];
    myStyle.height = props.size.button[1];
    button = (
      <div className={buttonClass} style={myStyle} onClick={togglePanel} />
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
      <Link to={{ pathname, search: queryToSearch(query) }}>{button}</Link>
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
