import clone               from 'mout/src/lang/clone';
import InlineToggleButton  from 'paraviewweb/src/React/Widgets/InlineToggleButtonWidget';
import React               from 'react';
import { hashHistory }     from 'react-router';

import {
    updateTime,
} from '../../client';

const VCR_CONTROL = [
    { icon: 'fa fa-fast-backward', delta: -1000000},
    { icon: 'fa fa-step-backward', delta: -1},
    { icon: 'fa fa-play', action: 'play'},
    { icon: 'fa fa-stop', action: 'stop'},
    { icon: 'fa fa-step-forward', delta: +1},
    { icon: 'fa fa-fast-forward', delta: +10000000},
];

require('./style.css');

export default React.createClass({

    displayName: 'TimePanel',

    propTypes: {
        dataset: React.PropTypes.object,
        location: React.PropTypes.object,
        params: React.PropTypes.object,
    },

    getInitialState() {
        return {
            timeIdx: 0,
        };
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.params && nextProps.params.timeIdx && nextProps.params.timeIdx !== this.state.timeIdx) {
            const timeIdx = Number(nextProps.params.timeIdx);
            if(Number.isInteger(timeIdx)) {
                this.setTimeIdx(timeIdx);
            } else {
                this.setTimeIdx(0);
            }
        }
    },

    setTimeIdx(timeIdx) {
        var pathname = this.props.location.pathname.split('/'),
            previousTime = -1;
        const query = clone(this.props.location.query);

        this.setState({timeIdx});
        updateTime(timeIdx);

        while(pathname.length > 3) {
            previousTime = Number(pathname.pop());
        }

        if(previousTime !== timeIdx) {
            pathname.push(timeIdx);
            pathname = pathname.join('/');
            hashHistory.push({ pathname, query });
        }
    },

    sliderTimeUpdate(event) {
        this.setTimeIdx(Number(event.target.value));
    },

    updateVCR(button) {
        var timeIdx = this.state.timeIdx;
        if(button.delta) {
            timeIdx += button.delta;
            timeIdx = (timeIdx < 0) ? 0 : timeIdx;
            timeIdx = (timeIdx >= this.props.dataset.data.time.length) ? (this.props.dataset.data.time.length - 1) : timeIdx;
            this.setTimeIdx(timeIdx);
        } else if(button.action) {
            this[button.action]();
        }
    },

    play() {
        if(!this.playing) {
            this.playing = true;
            this.keepPlaying();
        }
    },

    stop() {
        this.playing = false;
        this.forceUpdate();
    },

    keepPlaying() {
        if(this.playing) {
            if(this.state.timeIdx === this.props.dataset.data.time.length - 1) {
                this.updateVCR({delta: -10000000});
            } else {
                this.updateVCR({delta: 1});
            }
            setTimeout(this.keepPlaying, 50);
        }
    },

    render() {
        return (<div className={ 'TimePanel ' + ( this.playing ? 'is-playing' : '') }>
                    <InlineToggleButton height='10px' options={VCR_CONTROL} defaultColor='white' activeColor='white' onChange={ this.updateVCR }/>
                    <input type='range'
                            min='0'
                            max={ this.props.dataset.data.time.length - 1 }
                            value={ this.state.timeIdx }
                            onChange={ this.sliderTimeUpdate }/>
                    <span className='TimePanel__progress'>
                        { this.state.timeIdx + 1 } / { this.props.dataset.data.time.length }
                    </span>
                    <span className='TimePanel__real-time'>
                        { this.props.dataset.data.time.length ? this.props.dataset.data.time[this.state.timeIdx].value : '' }
                    </span>
                </div>);
    },
});
