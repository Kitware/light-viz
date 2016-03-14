import React from 'react';
import ColorBy from '../../widgets/ColorBy';
import Representation from '../../widgets/Representation';

import {
  enable,
  updateColor,
  updateRepresentation,
  updateUseClip,
}
from '../../client';

import style from 'LightVizStyle/AbstractPanel.mcss';

export default React.createClass({

  displayName: 'ModulePanel',

  propTypes: {
    allowVolumeRepresentation: React.PropTypes.bool,
    children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    dataset: React.PropTypes.object,
    enabledDefault: React.PropTypes.bool,
    hideInputSelection: React.PropTypes.bool,
    moduleName: React.PropTypes.string,
    name: React.PropTypes.string,
    needsApply: React.PropTypes.bool,
    noSolid: React.PropTypes.bool,
    onApply: React.PropTypes.func,
    onLookupTableChange: React.PropTypes.func,
    onReset: React.PropTypes.func,
    toolbarButtons: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
  },

  getDefaultProps() {
    return {
      allowVolumeRepresentation: false,
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
      inputValue: 'Data',
      representation: 'Surface',
    };
  },

  updateState(newState) {
    const representationIndex = newState.representation === 'Wireframe' ? 0 :
      (newState.representation === 'Surface' ? 1 :
        (newState.representation === 'Surface With Edges' ? 2 : 3));
    this.setState({
      enabled: newState.enabled,
      inputValue: (newState.use_clipped ? 'Clip' : 'Data'),
    });
    this.refs.representation.setState({
      activeIndex: representationIndex,
    });
    this.refs.colorBy.setState({
      value: newState.color,
    });
  },

  toggleEnabled() {
    const enabled = !this.state.enabled;
    enable(this.props.name, enabled);
    this.setState({
      enabled,
    });
  },

  updateLookupTable(name, field) {
    updateColor(name, field);
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
    this.setState({
      inputValue: event.target.value,
    });
  },

  updateRepresentation(name, repr) {
    updateRepresentation(name, repr);
    this.setState({
      representation: repr,
    });
  },

  // Only called if this.props.dataset.autoApply is false
  doApply() {
    if (!this.props.hideInputSelection) {
      const useClip = (this.state.inputValue === 'Clip');
      updateUseClip(this.props.name, useClip);
    }
    this.oldState = {};
    if (this.props.onApply) {
      this.props.onApply();
    }
  },

  // Only called if this.props.dataset.autoApply is false
  doReset() {
    this.setState(this.oldState);
    this.oldState = {};
    if (this.props.onReset) {
      this.props.onReset();
    }
  },

  render() {
    const enabledSwitchClass = this.state.enabled ? style.enabledSwitchOn :
                                                    style.enabledSwitchOff;
    const inputSelector = (
      <select
        className={style.inputSelector}
        value={this.state.inputValue}
        onChange={ this.updateInputTo }
      >
        <option key="Data" value="Data">Data</option>
        <option key="Clip" value="Clip">Clip</option>
      </select>
        );
    const enableApply = (this.oldState.inputValue &&
                        !(this.state.inputValue === this.oldState.inputValue))
                     || this.props.needsApply;
    const applyButton = (
      <i
        className={enableApply ? style.applyButton : style.applyButtonDisabled}
        onClick={ this.doApply }
      />
    );
    const resetButton = (
      <i
        className={enableApply ? style.refreshButton : style.refreshButtonDisabled}
        onClick={ this.doReset }
      />
    );
    return (
      <div className={style.abstractPanel}>
        <div className={style.topBar}>
          <div className={style.toolBarLeft}>
            <i className={enabledSwitchClass} onClick={ this.toggleEnabled } />
            { this.props.hideInputSelection ? null : inputSelector }
          </div>
          <span className={style.name}>{this.props.moduleName}</span>
          <div className={style.toolBarRight}>
            { this.props.toolbarButtons }
            { this.props.dataset.autoApply ? null : applyButton }
            { this.props.dataset.autoApply ? null : resetButton }
          </div>
        </div>
        <div className={ this.state.enabled ? style.contents : style.contentsDisabled}>
          <div className={style.controls}>
            <Representation
              ref="representation"
              name={this.props.name}
              onChange={ this.updateRepresentation }
              showVolume={ this.props.allowVolumeRepresentation}
            />
            <ColorBy
              dataset={ this.props.dataset }
              ref="colorBy"
              name={this.props.name}
              noSolid={this.props.noSolid}
              onChange={ this.updateLookupTable }
            />
          </div>
          {this.props.children}
        </div>
      </div>
    );
  },
});
