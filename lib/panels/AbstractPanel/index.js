import React            from 'react';
import ColorBy          from '../../widgets/ColorBy';
import Representation   from '../../widgets/Representation';

import {
    enable,
    updateColor,
    updateRepresentation,
    updateUseClip,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'ModulePanel',

    propTypes: {
        children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
        dataset: React.PropTypes.object,
        enabledDefault: React.PropTypes.bool,
        hideInputSelection: React.PropTypes.bool,
        moduleName: React.PropTypes.string,
        name: React.PropTypes.string,
        noSolid: React.PropTypes.bool,
        onLookupTableChange: React.PropTypes.func,
        toolbarButtons: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    },

    getDefaultProps() {
        return {
            hideInputSelection: false,
            moduleName: '',
            name: '',
            noSolid: false,
            onLookupTableChange: null,
            enabledDefault: false,
            toolbarButtons: null,
        };
    },

    getInitialState() {
        return {
            enabled: this.props.enabledDefault || false,
            inputValue: "Data",
        };
    },

    updateState(newState) {
      const representationIndex =  newState.representation === "Wireframe" ? 0 :
                                  (newState.representation === "Surface" ? 1 : 2);
      this.setState({ enabled: newState.enabled, inputValue: (newState.use_clipped ? 'Clip' : 'Data') });
      this._representation.setState({ activeIndex: representationIndex });
      this._colorBy.setState({ value: newState.color});
    },

    toggleEnabled() {
      const enabled = !this.state.enabled;
      this.setState({ enabled });
      enable(this.props.name, enabled);
    },

    updateLookupTable(name, field) {
      updateColor(name, field);
      if (this.props.onLookupTableChange) {
        this.props.onLookupTableChange(field);
      }
    },

    updateInputTo(event) {
      const useClip = (event.target.value === 'Clip');
      this.setState({inputValue: event.target.value});
      updateUseClip(this.props.name, useClip);
    },

    render() {
      const enabledSwitchClass = this.state.enabled ? 'fa fa-toggle-on is-enabled is-clickable' :
                                                      'fa fa-toggle-off is-disabled is-clickable';
      const inputSelector = (
          <select className="ModulePanel__InputSelector" value={this.state.inputValue} onChange={ this.updateInputTo }>
            <option key="Data" value="Data">Data</option>
            <option key="Clip" value="Clip">Clip</option>
          </select>
          );
      return (
        <div className="ModulePanel">
          <div className="ModulePanel_TopBar">
            <div className="ModulePanel_ToolBarLeft">
              <i className={enabledSwitchClass} onClick={ this.toggleEnabled }/>
              { this.props.hideInputSelection ? null : inputSelector }
            </div>
            <span className='ModulePanel__Name'>{this.props.moduleName}</span>
            <div className="ModulePanel_ToolBarRight">
              { this.props.toolbarButtons }
            </div>
          </div>
          <div className={ "ModulePanel_Contents " + (this.state.enabled ? '' : 'is-disable')}>
            <div className="ModulePanel__Controls">
              <Representation ref={(c) => {this._representation = c }}
                              name={this.props.name}
                              onChange={ updateRepresentation }/>
              <ColorBy dataset={ this.props.dataset }
                       ref={(c) => { this._colorBy = c  }}
                       name={this.props.name}
                       noSolid={this.props.noSolid}
                       onChange={ this.updateLookupTable }/>
            </div>
            {this.props.children}
          </div>
        </div>);
    },
});
