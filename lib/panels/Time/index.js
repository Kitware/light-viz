import clone from 'mout/src/lang/clone';
import InlineToggleButton from 'paraviewweb/src/React/Widgets/InlineToggleButtonWidget';
import React from 'react';
import {
  hashHistory,
}
from 'react-router';

import {
  updateTime,
}
from '../../client';

import style from 'LightVizStyle/TimePanel.mcss';

const VCR_CONTROL = [{
  icon: style.goToBeginningButton,
  delta: -1000000,
}, {
  icon: style.stepBackButton,
  delta: -1,
}, {
  icon: style.playButton,
  action: 'play',
}, {
  icon: style.stopButton,
  action: 'stop',
}, {
  icon: style.stepForwardButton,
  delta: +1,
}, {
  icon: style.goToEndButton,
  delta: +10000000,
}];

export default React.createClass({

  displayName: 'TimePanel',

  propTypes: {
    dataset: React.PropTypes.object,
    location: React.PropTypes.object,
    params: React.PropTypes.object,
    className: React.PropTypes.string,
  },

  getInitialState() {
    return {
      timeIdx: 0,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.timeIdx
     && nextProps.params.timeIdx !== this.state.timeIdx) {
      const timeIdx = Number(nextProps.params.timeIdx);
      if (Number.isInteger(timeIdx)) {
        this.setTimeIdx(timeIdx);
      } else {
        this.setTimeIdx(0);
      }
    }
  },

  setTimeIdx(timeIdx) {
    let pathname = this.props.location.pathname.split('/');
    let previousTime = -1;
    const query = clone(this.props.location.query);

    this.setState({
      timeIdx,
    });
    updateTime(timeIdx);

    while (pathname.length > 3) {
      previousTime = Number(pathname.pop());
    }

    if (previousTime !== timeIdx) {
      pathname.push(timeIdx);
      pathname = pathname.join('/');
      hashHistory.push({
        pathname, query,
      });
    }
  },

  sliderTimeUpdate(event) {
    this.setTimeIdx(Number(event.target.value));
  },

  updateVCR(button) {
    let timeIdx = this.state.timeIdx;
    if (button.delta) {
      timeIdx += button.delta;
      timeIdx = (timeIdx < 0) ? 0 : timeIdx;
      timeIdx = (timeIdx >= this.props.dataset.data.time.length)
        ? (this.props.dataset.data.time.length - 1) : timeIdx;
      this.setTimeIdx(timeIdx);
    } else if (button.action) {
      this[button.action]();
    }
  },

  play() {
    if (!this.playing) {
      this.playing = true;
      this.keepPlaying();
    }
  },

  stop() {
    this.playing = false;
    this.forceUpdate();
  },

  keepPlaying() {
    if (this.playing) {
      if (this.state.timeIdx === this.props.dataset.data.time.length - 1) {
        this.updateVCR({
          delta: -10000000,
        });
      } else {
        this.updateVCR({
          delta: 1,
        });
      }
      setTimeout(this.keepPlaying, 50);
    }
  },

  render() {
    return (
      <div
        className={[
          this.props.className,
          this.playing ? style.timePanelPlaying : style.timePanel,
        ].join(' ')}
      >
        <div className={style.linePiece}>
          <InlineToggleButton
            height="10px"
            options={VCR_CONTROL}
            defaultColor="white"
            activeColor="white"
            onChange={ this.updateVCR }
          />
          <input
            className={style.timeSlider}
            type="range"
            min="0"
            max={ this.props.dataset.data.time.length - 1 }
            value={ this.state.timeIdx }
            onChange={ this.sliderTimeUpdate }
          />
        </div>
        <div className={style.linePiece}>
          <span className={style.progress}>
            { this.state.timeIdx + 1 } / { this.props.dataset.data.time.length }
          </span>
          <span className={style.realTime}>
            { this.props.dataset.data.time.length ?
              this.props.dataset.data.time[this.state.timeIdx].value : '' }
          </span>
        </div>
      </div>
    );
  },
});
