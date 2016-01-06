import React from 'react';
import ColorBy          from '../../widgets/ColorBy';
import Representation   from '../../widgets/Representation';

import {
    enable,
    updateColor,
    updateRepresentation,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'ModulePanel',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        dataset: React.PropTypes.object,
        enabledDefault: React.PropTypes.bool,
        moduleName: React.PropTypes.string,
        name: React.PropTypes.string,
        noSolid: React.PropTypes.bool,
        onChange: React.PropTypes.func,
        toolbarButtons: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    },

    getDefaultProps() {
        return {
            moduleName: '',
            name: '',
            noSolid: false,
            onChange: null,
            enabledDefault: false,
        };
    },

    getInitialState() {
        return {
            enabled: this.props.enabledDefault || false,
        };
    },

    toggleEnabled() {
      const enabled = !this.state.enabled;
      this.setState({ enabled });
      enable(this.props.name, enabled);
    },

    render() {
      const enabledSwitchClass = this.state.enabled ? 'fa fa-toggle-on is-enabled is-clickable' :
                                                      'fa fa-toggle-off is-disabled is-clickable';
      return (
        <div className="ModulePanel">
          <div className="ModulePanel_TopBar">
            <i className={enabledSwitchClass} onClick={ this.toggleEnabled }/>
            <span className='ModulePanel__Name'>{this.props.moduleName}</span>
            <div className="ModulePanel_ToolBarButtons">
              { this.props.toolbarButtons }
            </div>
          </div>
          <div className="ModulePanel_Contents">
            <div className="ModulePanel__Controls">
              <Representation name={this.props.name} onChange={ updateRepresentation }/>
              <ColorBy dataset={ this.props.dataset }
                       name={this.props.name}
                       noSolid={this.props.noSolid}
                       onChange={ updateColor }/>
            </div>
            {this.props.children}
          </div>
        </div>);
    },
});
