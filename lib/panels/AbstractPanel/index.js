import React from 'react';
import ColorBy from '../../widgets/ColorBy';
import Representation from '../../widgets/Representation';
import SvgIcon from 'paraviewweb/src/React/Widgets/SvgIconWidget';
import modules from '../../modules';

import {
  enable,
  updateColor,
  updateRepresentation,
  updateUseClip,
}
from '../../client';

import style from 'LightVizStyle/AbstractPanel.mcss';

import usingClipIcon from '../../../svg/Clip.svg';
import notUsingClipIcon from '../../../svg/DataSet.svg';

export default React.createClass({

  displayName: 'ModulePanel',

  propTypes: {
    allowVolumeRepresentation: React.PropTypes.bool,
    children: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
    dataset: React.PropTypes.object,
    enabledDefault: React.PropTypes.bool,
    hideAllButVisibility: React.PropTypes.bool,
    hideInputSelection: React.PropTypes.bool,
    moduleName: React.PropTypes.string,
    name: React.PropTypes.string,
    needsApply: React.PropTypes.bool,
    noSolid: React.PropTypes.bool,
    onApply: React.PropTypes.func,
    onLookupTableChange: React.PropTypes.func,
    onReset: React.PropTypes.func,
    representationsToUse: React.PropTypes.array,
    toolbarButtons: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]),
  },

  getDefaultProps() {
    return {
      allowVolumeRepresentation: false,
      hideAllButVisibility: false,
      hideInputSelection: false,
      moduleName: '',
      name: '',
      noSolid: false,
      onLookupTableChange: null,
      enabledDefault: false,
      representationsToUse: null,
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
    const useClip = (this.state.inputValue !== 'Clip');
    if (this.props.dataset.autoApply) {
      updateUseClip(this.props.name, useClip);
    } else if (!this.oldState.inputValue) {
      this.oldState.inputValue = this.state.inputValue;
    }
    this.setState({
      inputValue: useClip ? 'Clip' : 'Data',
    });
  },

  updateRepresentation(name, repr) {
    updateRepresentation(name, repr);
    this.setState({
      representation: repr,
    });
    if (repr === 'Volume') { // Volume rendering
      if (this.refs.colorBy.state.value === '__SOLID__') {
        this.refs.colorBy.setState({ value: this.props.dataset.data.arrays[0].name });
        this.updateLookupTable(this.props.name, this.props.dataset.data.arrays[0].name);
      }
    }
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
    // console.log(modules, this.props.name);
    const enabledStyle = this.state.enabled
      ? { position: 'relative', left: '-5px', top: '2px', opacity: 1 }
      : { position: 'relative', left: '-5px', top: '2px', opacity: 0.5 };
    const inputSelector = (
      <div className={style.inputSelector} onClick={ this.updateInputTo }>
        <span style={{ position: 'relative', top: '-4px' }}>{'<'}</span>
        <SvgIcon
          icon={this.state.inputValue === 'Data' ? notUsingClipIcon : usingClipIcon}
          width="25px"
          height="25px"
          style={{ position: 'relative', left: '5px', top: '2px' }}
        />
      </div>
        );
    const enableApply = (this.oldState.inputValue &&
                        !(this.state.inputValue === this.oldState.inputValue))
                     || this.props.needsApply;
    const applyButton = (
      <button
        className={enableApply ? style.applyButton : style.applyButtonDisabled}
        onClick={ this.doApply }
      >
      Apply
      </button>
    );
    const resetButton = (
      <button
        className={enableApply ? style.refreshButton : style.refreshButtonDisabled}
        onClick={ this.doReset }
      >
      Reset
      </button>
    );
    const disableSolidColor = this.props.noSolid || this.state.representation === 'Volume';
    return (
      <div className={style.abstractPanel}>
        <div className={style.topBar}>
          <div className={style.toolBarLeft}>
            <div className={style.clickable} onClick={ this.toggleEnabled }>
              <SvgIcon
                icon={modules.filter(m => m.name === this.props.name)[0].icon}
                height="25px"
                width="25px"
                style={enabledStyle}
              />
            </div>
            {
              this.props.hideAllButVisibility || this.props.hideInputSelection ?
                null : inputSelector
            }
            <span
              className={this.props.hideAllButVisibility
                  ? style.visibleModuleName
                  : style.hiddenModuleName}
            >{this.props.moduleName}</span>
            { this.props.hideAllButVisibility ? null : this.props.toolbarButtons }
          </div>
          <div className={style.toolBarRight}>
            {
              this.props.hideAllButVisibility || this.props.dataset.autoApply ? null : applyButton
            }
            {
              this.props.hideAllButVisibility || this.props.dataset.autoApply ? null : resetButton
            }
          </div>
        </div>
        <div className={ this.state.enabled ? style.contents : style.contentsDisabled}>
          <div className={style.controls}>
            <Representation
              ref="representation"
              name={this.props.name}
              onChange={ this.updateRepresentation }
              representations={ this.props.representationsToUse }
              showVolume={ this.props.allowVolumeRepresentation}
            />
            <ColorBy
              dataset={ this.props.dataset }
              ref="colorBy"
              name={this.props.name}
              noSolid={disableSolidColor}
              onChange={ this.updateLookupTable }
            />
          </div>
          {this.props.children}
        </div>
      </div>
    );
  },
});
