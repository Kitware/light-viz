import React       from 'react';
import TogglePanel from '../../widgets/TogglePanel';

export default React.createClass({

    displayName: 'ModuleContainer',

    propTypes: {
        className: React.PropTypes.string,
        dataset: React.PropTypes.object,
        freePanels: React.PropTypes.array,
        location: React.PropTypes.object,
        panel: React.PropTypes.object,
    },

    render() {
        // const props = Object.merge({ key: this.props.panel.name }, this.props);
        const content = React.createElement(this.props.panel.component, this.props);
        return (<TogglePanel className={ this.props.className } anchor={['top', 'right']} position={['top', 'left-shift']}
                            location={ this.props.location } independentVisibilityPanels={this.props.freePanels}
                            icon= { this.props.panel.icon }
                            panelId={ this.props.panel.name }>
                        { content }
                </TogglePanel>);
    },
});
