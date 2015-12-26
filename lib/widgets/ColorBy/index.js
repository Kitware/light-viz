import React from 'react';

export default React.createClass({

    displayName: 'ColorBy',

    propTypes: {
        dataset: React.PropTypes.object,
        name: React.PropTypes.string,
        onChange: React.PropTypes.func,
        value: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            name: 'ColorBy',
            value: '__SOLID__',
            dataset: { data: { arrays: [] }},
            onChange: null,
        };
    },

    getInitialState() {
        return {
            value: this.props.value,
        };
    },

    updateColorBy(event) {
        if(this.props.onChange) {
            this.props.onChange(this.props.name, event.target.value);
        }
        this.setState({value: event.target.value});
    },

    render() {
        return  <select value={this.state.value} onChange={ this.updateColorBy }>
                    <option key='__SOLID__' value='__SOLID__'>Solid color</option>
                    {  this.props.dataset.data.arrays.map(array => {
                        return <option key={array.name} value={array.name}>{array.label}</option>
                    })}
                </select>;
    },
});
