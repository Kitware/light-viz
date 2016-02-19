import equals               from 'mout/src/array/equals';
import clone                from 'mout/src/lang/clone';
import DoubleSliderElement  from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import React                from 'react';
import AbstractPanel        from '../AbstractPanel';

import {
    getState,
    updateContourBy,
    updateContourValues,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'ContourPanel',

    propTypes: {
        dataset: React.PropTypes.object,
    },

    getDefaultProps() {
        return {
            dataset: { data: { arrays: [] }},
        };
    },

    getInitialState() {
        this.oldState = {
            values: [],
            field: '',
        };
        return {
            values: [],
            field: '',
        };
    },

    componentDidMount() {
        getState('contour', this, this._modulePanel);
    },

    componentWillReceiveProps(nextProps) {
        var previous = this.props.dataset.data.arrays,
            next = nextProps.dataset.data.arrays;

        if(!equals(previous, next)) {
            if(next.length) {
                this.oldState = {
                    values: [ 0.5*(next[0].range[0]+ next[0].range[1]) ],
                    field: next[0].name,
                };
                this.setState(clone(this.oldState));
            } else {
                this.oldState = {
                    values: [ ],
                    field: '',
                };
                this.setState(clone(this.oldState));
            }
        }
    },

    updateState(newState) {
        var localState = { values: newState.values, field: this.state.field };
        if (newState.field !== '') {
          localState.field = newState.field
        }
        this.oldState = clone(localState);
        this.oldState.values = clone(localState.values);
        this.setState(localState);
    },

    updateContourBy(field) {
        this.setState({field});

        if (this.props.dataset.autoApply) {
            updateContourBy(field);
        }
    },

    addContour() {
        const values = this.state.values;
        const fieldRange = [0,1];
        this.props.dataset.data.arrays.forEach( array => {
            if(array.name === this.state.field) {
                fieldRange[0] = array.range[0];
                fieldRange[1] = array.range[1];
            }
        });
        const newValue = (fieldRange[0] + fieldRange[1]) * 0.5;

        values.push(newValue);
        this.setState({values});

        if (this.props.dataset.autoApply) {
            updateContourValues(values);
        }
    },

    removeContour(e) {
        const idx = Number(e.target.getAttribute('name')),
            values = this.state.values;

        values.splice(idx, 1);
        this.setState({values});

        if (this.props.dataset.autoApply) {
            updateContourValues(values);
        }
    },

    valueChange(name, value) {
        const idx = Number(name),
            values = this.state.values;

        values[idx] = value;
        this.setState({values});

        if (this.props.dataset.autoApply) {
            updateContourValues(values);
        }
    },

    onApply() {
        updateContourValues(this.state.values);
        updateContourBy(this.state.field);
        this.oldState = clone(this.state);
        this.oldState.values = clone(this.state.values);
    },

    onReset() {
        this.setState({field:this.oldState.field, values: clone(this.oldState.values)});
    },

    render() {
        const needsApply = !equals(this.oldState.values, this.state.values) || !(this.oldState.field === this.state.field);
        const fieldRange = [0,1];
        this.props.dataset.data.arrays.forEach( array => {
            if(array.name === this.state.field) {
                fieldRange[0] = array.range[0];
                fieldRange[1] = array.range[1];
            }
        });
        return (<AbstractPanel
                  ref={(c) => { this._modulePanel = c }}
                  name='contour'
                  moduleName='Contour'
                  dataset={this.props.dataset}
                  noSolid
                  onLookupTableChange={this.updateContourBy}
                  onApply={ this.onApply }
                  onReset={ this.onReset }
                  needsApply={ needsApply }
                  toolbarButtons= {
                    <i className='fa fa-fw fa-plus is-clickable' onClick={ this.addContour }></i>
                  }>
                    { this.state.values.map( (v, idx) => {
                        return <div key={ idx } className='ContourPanel_line'>
                                    <i className='fa fa-fw fa-trash-o is-clickable'
                                       name={idx}
                                       onClick={ this.removeContour }></i>
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
