import equals               from 'mout/src/array/equals';
import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import ToggleButton         from 'tonic-ui/lib/react/widget/ToggleIconButton';
import ColorBy              from '../../widgets/ColorBy';
import Representation       from '../../widgets/Representation';

import {
    updateColor,
    enable,
    updateRepresentation,
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
            enabled: false,
        };
    },

    componentWillReceiveProps(nextProps) {
        var previous = this.props.dataset.data.arrays,
            next = nextProps.dataset.data.arrays;

        if(!equals(previous, next)) {
            if(next.length) {
                this.setState({
                    values: [ 0.5*(next[0].range[0]+ next[0].range[1]) ],
                    field: next[0].name,
                    enabled: false,
                });
            } else {
                this.setState({
                    values: [ ],
                    field: '',
                    enabled: false,
                });
            }
        }
    },

    updateContourBy(name, field) {
        this.setState({field});

        updateColor(name, field);
        updateContourBy(field);
    },

    toggleEnable(enabled) {
        this.setState({enabled});
        enable('contour', enabled);
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
        return (<div className='ContourPanel'>
                    <ToggleButton value={ this.state.enabled } onChange={ this.toggleEnable }/>
                    <ColorBy noSolid dataset={ this.props.dataset } name='contour' onChange={ this.updateContourBy } />
                    <Representation name='contour' onChange={ updateRepresentation } />
                    <i className='fa fa-fw fa-plus' onClick={ this.addContour }></i>
                    { this.state.values.map( (v, idx) => {
                        return <div key={ idx } className='ContourPanel_line'>
                                    <div style={{width: 'calc(100% - 35px)'}}>
                                        <DoubleSliderElement
                                            min={ fieldRange[0] }
                                            max={ fieldRange[1] }
                                            value={ v }
                                            name={ '' + idx } onChange={ this.valueChange } />
                                    </div>
                                    <div style={{width: '35px', textAlign: 'center'}} name={idx} onClick={ this.removeContour }>
                                        <i className='fa fa-fw fa-trash-o' name={idx}></i>
                                    </div>
                                </div>;
                    })}
                </div>);
    },
});
