import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import AbstractPanel        from '../AbstractPanel';

import {
    getState,
    updateMultiSliceAxis,
    updateMultiSliceValues,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'MultiSlicePanel',

    propTypes: {
        dataset: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            dataset: { data: { arrays: [], bounds: [0, 1, 0, 1, 0, 1]} },
        };
    },

    getInitialState() {
        return {
            values: [],
            axis: 0,
        };
    },

    componentDidMount() {
        getState('mslice', this, this._modulePanel);
    },

    updateState(newState) {
        var localState = { values: newState.positions, axis: newState.normal };
        this.setState(localState);
    },

    addSlice() {
        const values = this.state.values,
            lastValue = values.length > 0 ? values[values.length - 1] : 0;

        values.push(lastValue);
        this.setState({values});

        updateMultiSliceValues(values);
    },

    removeSlice(e) {
        const idx = Number(e.target.getAttribute('name')),
            values = this.state.values;

        values.splice(idx, 1);
        this.setState({values});

        updateMultiSliceValues(values);
    },

    valueChange(name, value) {
        const idx = Number(name),
            values = this.state.values;

        values[idx] = value;
        this.setState({values});

        updateMultiSliceValues(values);
    },

    updateAxis(e) {
        this.setState({axis: e.target.value});
        updateMultiSliceAxis(e.target.value);
    },

    render() {
        const fieldRange = [this.props.dataset.data.bounds[this.state.axis * 2],
                            this.props.dataset.data.bounds[this.state.axis * 2 + 1]];
        return (<AbstractPanel
                  ref={(c) => { this._modulePanel = c }}
                  name='mslice'
                  moduleName='Multi-Slice'
                  dataset={this.props.dataset}
                  noSolid
                  toolbarButtons= {
                    <i className='fa fa-fw fa-plus is-clickable' onClick={ this.addSlice }></i>
                  }>
                      <div className='MultiSlicePanel_axisline'>
                          <span>Slice Normal: </span>
                          <select value={ this.state.axis } onChange={ this.updateAxis }>
                              <option key={0} value={0}>X Axis</option>
                              <option key={1} value={1}>Y Axis</option>
                              <option key={2} value={2}>Z Axis</option>
                          </select>
                      </div>
                    { 
                      this.state.values.map( (v, idx) => {
                        return <div key={ idx } className='MultiSlicePanel_line'>
                                    <i className='fa fa-fw fa-trash-o is-clickable'
                                       name={idx}
                                       onClick={ this.removeSlice }></i>
                                    <DoubleSliderElement
                                        min={ fieldRange[0] }
                                        max={ fieldRange[1] }
                                        value={ v }
                                        name={ '' + idx } onChange={ this.valueChange } />
                                </div>;
                    })}
                </AbstractPanel>);
    },
});
