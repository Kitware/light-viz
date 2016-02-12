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
        onApply: React.PropTypes.func,
        onLookupTableChange: React.PropTypes.func,
        onReset: React.PropTypes.func,
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
        this.oldState = {};
        return {
            enabled: this.props.enabledDefault || false,
            inputValue: "Data",
            representation: "Surface",
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
      if (this.props.dataset.autoApply) {
        enable(this.props.name, enabled);
      } else if (!this.oldState.enabled) {
        this.oldState.enabled = this.state.enabled;
      }
      this.setState({ enabled });
    },

    updateLookupTable(name, field) {
      if (this.props.dataset.autoApply) {
        updateColor(name, field);
      } else if (!this.oldState.lookupTable) {
        this.oldState.lookupTable = this._colorBy.state.value;
      }
      if (this.props.onLookupTableChange) {
        this.props.onLookupTableChange(field);
      }
    },

    updateInputTo(event) {
      const useClip = (event.target.value === 'Clip');
      if (this.props.dataset.autoApply) {
        updateUseClip(this.props.name, useClip);
      } else if (!this.oldState.inputValue) {
        this.oldState.inputValue = this.state.inputValue;
      }
      this.setState({inputValue: event.target.value});
    },

    updateRepresentation(name, repr) {
      if (this.props.dataset.autoApply) {
        updateRepresentation(name, repr);
      } else if (!this.oldState.representation) {
        this.oldState.representation = this.state.representation;
      }
      this.setState({representation: repr })
    },

    // Only called if this.props.dataset.autoApply is false
    doApply() {
      enable(this.props.name, this.state.enabled);
      updateColor(this.props.name, this._colorBy.state.value);
      if (!this.props.hideInputSelection) {
        const useClip = (this.state.inputValue === 'Clip');
        updateUseClip(this.props.name, useClip);
      }
      updateRepresentation(this.props.name, this.state.representation);
      this.oldState = {};
      if (this.props.onApply) {
        this.props.onApply();
      }
    },

    // Only called if this.props.dataset.autoApply is false
    doReset() { 
      this.setState( this.oldState );
      if (this.oldState.representation) {
        const representationIndex =  this.oldState.representation === "Wireframe" ? 0 :
                                    (this.oldState.representation === "Surface" ? 1 : 2);
        this._representation.setState({ activeIndex: representationIndex });
      }
      if (this.oldState.lookupTable) {
        this._colorBy.setState({ value: this.oldState.lookupTable });
      }
      this.oldState = {};
      if (this.props.onReset) {
        this.props.onReset();
      }
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
      const applyEnableClass = this.oldState === {} ? 'is-disabled' : 'is-enabled';
      const applyButton = <i className={'fa fa-check is-clickable ' + applyEnableClass} onClick={ this.doApply }/>;
      const resetButton = <i className={'fa fa-refresh is-clickable ' + applyEnableClass} onClick={ this.doReset }/>;
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
              { this.props.dataset.autoApply ? null : applyButton }
              { this.props.dataset.autoApply ? null : resetButton }
            </div>
          </div>
          <div className={ "ModulePanel_Contents " + (this.state.enabled ? '' : 'is-disable')}>
            <div className="ModulePanel__Controls">
              <Representation ref={(c) => {this._representation = c }}
                              name={this.props.name}
                              onChange={ this.updateRepresentation }/>
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
