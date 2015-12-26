import React from 'react';

const REPRESENTATION_TYPES = ['Wireframe', 'Surface', 'Surface With Edges'];

export default React.createClass({

    displayName: 'Representation',

    propTypes: {
        name: React.PropTypes.string,
        onChange: React.PropTypes.func,
        value: React.PropTypes.string,
    },

    getDefaultProps() {
        return {
            name: 'Representation',
            value: null,
            onChange: null,
        };
    },

    getInitialState() {
        return {
            value: this.props.value || 'Surface',
        };
    },

    updateRepresentationTo(event) {
        if(this.props.onChange) {
            this.props.onChange(this.props.name, event.target.value);
        }
        this.setState({value: event.target.value})
    },

    render() {
        return  <select value={this.state.value} onChange={ this.updateRepresentationTo }>
                    {  REPRESENTATION_TYPES.map(name => {
                        return <option key={name} value={name}>{name}</option>
                    })}
                </select>;
    },
});
