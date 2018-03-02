import React from 'react';
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
  className: React.PropTypes.string,
  dataset: React.PropTypes.object,
  freePanels: React.PropTypes.array,
  location: React.PropTypes.object,
  panel: React.PropTypes.object,
};

Module.defaultProps = {
  className: undefined,
  dataset: undefined,
  freePanels: undefined,
  location: undefined,
  panel: undefined,
};

export default Module;
