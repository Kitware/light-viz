import equals               from 'mout/src/array/equals';
import clone                from 'mout/src/lang/clone';
import DoubleSliderElement  from 'paraviewweb/src/React/Widgets/DoubleSliderWidget';
import React                from 'react';

import style from 'LightVizStyle/ContourPanel.mcss';

import AbstractPanel        from '../AbstractPanel';

import {
    getState,
    updateContourBy,
    updateContourValues,
} from '../../client';

function arrayIsOnPoints(array) {
  return array.dimension === 1 && array.location === 'Point';
}

export default React.createClass({

  displayName: 'ContourPanel',

  propTypes: {
    dataset: React.PropTypes.object,
    hideAdditionalControls: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      dataset: {
        data: {
          arrays: [],
        },
      },
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
    getState('contour', this, this.modulePanel);
  },

  componentWillReceiveProps(nextProps) {
    const previous = this.props.dataset.data.arrays;
    const next = nextProps.dataset.data.arrays;

    if (!equals(previous, next)) {
      if (next.length) {
        this.oldState = {
          values: [0.5 * (next[0].range[0] + next[0].range[1])],
          field: next[0].name,
        };
        this.setState(clone(this.oldState));
      } else {
        this.oldState = {
          values: [],
          field: '',
        };
        this.setState(clone(this.oldState));
      }
    }

    if (this.props.dataset.autoApply !== nextProps.dataset.autoApply) {
      this.onApply();
    }
  },

  onApply() {
    updateContourValues(this.state.values);
    updateContourBy(this.state.field);
    this.oldState = clone(this.state);
    this.oldState.values = clone(this.state.values);
    this.setState({ applyDone: true });
    this.oldState.applyDone = true;
  },

  onReset() {
    this.setState({
      field: this.oldState.field,
      values: clone(this.oldState.values),
    });
  },

  updateState(newState) {
    const localState = {
      values: newState.values,
      field: this.state.field,
    };
    if (newState.field !== '') {
      localState.field = newState.field;
    }
    this.oldState = clone(localState);
    this.oldState.values = clone(localState.values);
    this.setState(localState);
  },

  updateContourBy(field, location) {
    const fieldRange = [0, 1];
    const newFieldRange = [0, 1];
    this.props.dataset.data.arrays.forEach((array) => {
      if (array.name === this.state.field && array.location === location) {
        fieldRange[0] = array.range[0];
        fieldRange[1] = array.range[1];
      }
      if (array.name === field && array.location === location) {
        newFieldRange[0] = array.range[0];
        newFieldRange[1] = array.range[1];
      }
    });

    const newValues = this.state.values.map(val =>
      ((val - fieldRange[0]) / (fieldRange[1] - fieldRange[0]) *
      (newFieldRange[1] - newFieldRange[0])) + newFieldRange[0]
    );

    this.setState({
      field,
      values: newValues,
      applyDone: false,
    });
    this.oldState.applyDone = false;

    if (this.props.dataset.autoApply) {
      updateContourBy(field);
      updateContourValues(newValues);
    }
  },

  addContour() {
    const values = this.state.values;
    const fieldRange = [0, 1];
    this.props.dataset.data.arrays.forEach((array) => {
      if (array.name === this.state.field) {
        fieldRange[0] = array.range[0];
        fieldRange[1] = array.range[1];
      }
    });
    const newValue = (fieldRange[0] + fieldRange[1]) * 0.5;

    values.push(newValue);
    this.setState({
      values,
      applyDone: false,
    });
    this.oldState.applyDone = false;

    if (this.props.dataset.autoApply) {
      updateContourValues(values);
    }
  },

  removeContour(e) {
    const idx = Number(e.target.getAttribute('name'));
    const values = this.state.values;

    values.splice(idx, 1);
    this.setState({
      values,
      applyDone: false,
    });
    this.oldState.applyDone = false;

    if (this.props.dataset.autoApply) {
      updateContourValues(values);
    }
  },

  valueChange(name, value) {
    const idx = Number(name);
    const values = this.state.values;

    values[idx] = value;
    this.setState({
      values,
      applyDone: false,
    });
    this.oldState.applyDone = false;

    if (this.props.dataset.autoApply) {
      updateContourValues(values);
    }
  },

  render() {
    const needsApply = !equals(this.oldState.values, this.state.values)
                    || !(this.oldState.field === this.state.field);
    const fieldRange = [0, 1];
    this.props.dataset.data.arrays.forEach((array) => {
      if (array.name === this.state.field) {
        fieldRange[0] = array.range[0];
        fieldRange[1] = array.range[1];
      }
    });
    return (
      <AbstractPanel
        ref={c => (this.modulePanel = c)}
        name="contour"
        moduleName="Contour"
        dataset={this.props.dataset}
        hideAllButVisibility={this.props.hideAdditionalControls}
        noSolid
        shouldIncludeArray={arrayIsOnPoints}
        onLookupTableChange={this.updateContourBy}
        onApply={this.onApply}
        onReset={this.onReset}
        needsApply={needsApply}
        toolbarButtons={
          <i className={style.addButton} onClick={this.addContour} />
        }
      >
        {
          this.state.values.map((v, idx) =>
            <div key={idx} className={style.line}>
              <i
                className={style.deleteButton}
                name={idx}
                onClick={this.removeContour}
              />
              <DoubleSliderElement
                min={fieldRange[0]}
                max={fieldRange[1]}
                value={v}
                name={`${idx}`}
                onChange={this.valueChange}
              />
            </div>
          )
        }
      </AbstractPanel>);
  },
});
