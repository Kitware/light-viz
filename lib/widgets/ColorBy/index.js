import React from 'react';

export default React.createClass({

  displayName: 'ColorBy',

  propTypes: {
    dataset: React.PropTypes.object,
    name: React.PropTypes.string,
    className: React.PropTypes.string,
    noSolid: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    shouldIncludeArray: React.PropTypes.func,
    value: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      dataset: {
        data: {
          arrays: [],
        },
      },
      name: 'ColorBy',
      noSolid: false,
      onChange: null,
      value: '__SOLID__',
    };
  },

  getInitialState() {
    return {
      value: this.props.value,
    };
  },

  updateColorBy(event) {
    const [location, name] = event.target.value.split('=:=');
    if (this.props.onChange) {
      this.props.onChange(this.props.name, name, location);
    }
    this.setState({
      value: event.target.value,
    });
  },

  render() {
    const otherList = [];
    if (!this.props.noSolid) {
      otherList.push(<option key="__SOLID__" value="__SOLID__=:=__SOLID__">Solid color</option>);
    }
    const arraysToUse = this.props.shouldIncludeArray ?
      this.props.dataset.data.arrays.filter(this.props.shouldIncludeArray) :
      this.props.dataset.data.arrays;
    return (
      <select
        value={this.state.value}
        onChange={this.updateColorBy}
        className={this.props.className}
      >
        {otherList}
        {
          arraysToUse.map((array, idx) =>
            <option key={idx} value={[array.location, array.name].join('=:=')}>{this.props.shouldIncludeArray ? `${array.label}` : `(${array.location[0]}) ${array.label}`}</option>
          )
        }
      </select>
    );
  },
});
