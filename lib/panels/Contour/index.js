import equals               from 'mout/src/array/equals';
import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
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
                this.setState({
                    values: [ 0.5*(next[0].range[0]+ next[0].range[1]) ],
                    field: next[0].name,
                });
            } else {
                this.setState({
                    values: [ ],
                    field: '',
                });
            }
        }
    },

    updateState(newState) {
        var localState = { values: newState.values, field: this.state.field };
        if (newState.field !== '') {
          localState.field = newState.field
        }
        this.setState(localState);
    },

    updateContourBy(name, field) {
        this.setState({field});

        updateContourBy(field);
    },

    addContour() {
        const values = this.state.values,
            lastValue = values[values.length - 1];

        values.push(lastValue);
        this.setState({values});

        updateContourValues(values);
    },

    removeContour(e) {
        const idx = Number(e.target.getAttribute('name')),
            values = this.state.values;

        values.splice(idx, 1);
        this.setState({values});

        updateContourValues(values);
    },

    valueChange(name, value) {
        const idx = Number(name),
            values = this.state.values;

        values[idx] = value;
        this.setState({values});

        updateContourValues(values);
    },

    render() {
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
