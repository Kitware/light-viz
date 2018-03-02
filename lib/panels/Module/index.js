import React from 'react';
import PropTypes from 'prop-types';
import TogglePanel from '../../widgets/TogglePanel';

const Module = (props) => {
  // const props = Object.merge({ key: this.props.panel.name }, this.props);
  const content = React.createElement(props.panel.component, props);
  return (
    <TogglePanel
      className={props.className}
      anchor={['top', 'right']}
      position={['top', 'left-shift']}
      location={props.location}
      independentVisibilityPanels={props.freePanels}
      svg={props.panel.icon}
      panelId={props.panel.name}
    >
      {content}
    </TogglePanel>
  );
};

Module.propTypes = {
  className: PropTypes.string,
  dataset: PropTypes.object,
  freePanels: PropTypes.array,
  location: PropTypes.object,
  panel: PropTypes.object,
};

Module.defaultProps = {
  className: undefined,
  dataset: undefined,
  freePanels: undefined,
  location: undefined,
  panel: undefined,
};

export default Module;
