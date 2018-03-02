import React from 'react';
import PropTypes from 'prop-types';

export default class ColorBy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };

    this.updateColorBy = this.updateColorBy.bind(this);
  }

  updateColorBy(event) {
    const [location, name] = event.target.value.split('=:=');
    if (this.props.onChange) {
      this.props.onChange(this.props.name, name, location);
    }
    this.setState({
      value: event.target.value,
    });
  }

  render() {
    const otherList = [];
    if (!this.props.noSolid) {
      otherList.push(
        <option key="__SOLID__" value="__SOLID__=:=__SOLID__">
          Solid color
        </option>
      );
    }
    const arraysToUse = this.props.shouldIncludeArray
      ? this.props.dataset.data.arrays.filter(this.props.shouldIncludeArray)
      : this.props.dataset.data.arrays;
    return (
      <select
        value={this.state.value}
        onChange={this.updateColorBy}
        className={this.props.className}
      >
        {otherList}
        {arraysToUse.map((array, idx) => (
          <option key={idx} value={[array.location, array.name].join('=:=')}>
            {this.props.shouldIncludeArray
              ? `${array.label}`
              : `(${array.location[0]}) ${array.label}`}
          </option>
        ))}
      </select>
    );
  }
}

ColorBy.propTypes = {
  dataset: PropTypes.object,
  name: PropTypes.string,
  className: PropTypes.string,
  noSolid: PropTypes.bool,
  onChange: PropTypes.func,
  shouldIncludeArray: PropTypes.func,
  value: PropTypes.string,
};

ColorBy.defaultProps = {
  dataset: {
    data: {
      arrays: [],
    },
  },
  name: 'ColorBy',
  noSolid: false,
  onChange: null,
  value: '__SOLID__=:=__SOLID__',
  className: '',

  shouldIncludeArray: undefined,
};
