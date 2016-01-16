import equals               from 'mout/src/array/equals';
import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import ToggleButton         from 'tonic-ui/lib/react/widget/ToggleIconButton';
import AbstractPanel        from '../AbstractPanel';

import {
    getState,
    updateClipInsideOut,
    updateClipPosition,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'ClipPanel',

    propTypes: {
        dataset: React.PropTypes.object,
    },

    getDefaultProps() {
        return { dataset: { data: { bounds: [0,1,0,1,0,1] } } };
    },

    getInitialState() {
        return {
            xPosition: (this.props.dataset.data.bounds[0] + this.props.dataset.data.bounds[1])*0.5,
            yPosition: (this.props.dataset.data.bounds[2] + this.props.dataset.data.bounds[3])*0.5,
            zPosition: (this.props.dataset.data.bounds[4] + this.props.dataset.data.bounds[5])*0.5,
            xInsideOut: false,
            yInsideOut: false,
            zInsideOut: false,
        };
    },

    componentDidMount() {
        getState('clip', this, this._modulePanel);
    },

    componentWillReceiveProps(nextProps) {
        var previous = this.props.dataset.data.bounds,
            next = nextProps.dataset.data.bounds;

        if(!equals(previous, next)) {
            this.setState({
                xPosition: (next[0] + next[1])*0.5,
                yPosition: (next[2] + next[3])*0.5,
                zPosition: (next[4] + next[5])*0.5,
            });
        }
    },

    toggleInsideOut(onOff, name) {
        const {xInsideOut, yInsideOut, zInsideOut} = this.state,
            insideOut = {xInsideOut, yInsideOut, zInsideOut};

        this.setState({[name]:onOff});
        insideOut[name] = onOff;

        updateClipInsideOut(insideOut.xInsideOut, insideOut.yInsideOut, insideOut.zInsideOut);
    },

    positionChange(name, value) {
        const {xPosition, yPosition, zPosition} = this.state,
            pos = {xPosition, yPosition, zPosition};

        this.setState({[name]:value});

        // Update server
        pos[name] = value;
        updateClipPosition(pos);
    },

    render() {
        return (<AbstractPanel ref={(c) => { this._modulePanel = c }}
                             name='clip'
                             dataset={this.props.dataset}
                             hideInputSelection
                             moduleName='Clip'>
                    <div className='ClipPanel_line'>
                        <ToggleButton
                            alwaysOn
                            value={ this.state.xInsideOut }
                            icon={'fa-toggle-on ' + (this.state.xInsideOut ? 'fa-flip-horizontal' : '')}
                            name='xInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <DoubleSliderElement
                            min={ this.props.dataset.data.bounds[0] }
                            max={ this.props.dataset.data.bounds[1] }
                            value={ this.state.xPosition }
                            name='xPosition' onChange={ this.positionChange } />
                    </div>
                    <div className='ClipPanel_line'>
                        <ToggleButton
                            alwaysOn
                            value={ this.state.yInsideOut }
                            icon={'fa-toggle-on ' + (this.state.yInsideOut ? 'fa-flip-horizontal' : '')}
                            name='yInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <DoubleSliderElement
                            min={ this.props.dataset.data.bounds[2] }
                            max={ this.props.dataset.data.bounds[3] }
                            value={ this.state.yPosition }
                            name='yPosition' onChange={ this.positionChange } />
                    </div>
                    <div className='ClipPanel_line'>
                        <ToggleButton
                            alwaysOn
                            value={ this.state.zInsideOut }
                            icon={'fa-toggle-on ' + (this.state.zInsideOut ? 'fa-flip-horizontal' : '')}
                            name='zInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <DoubleSliderElement
                            min={ this.props.dataset.data.bounds[4] }
                            max={ this.props.dataset.data.bounds[5] }
                            value={ this.state.zPosition }
                            name='zPosition' onChange={ this.positionChange } />
                    </div>
                </AbstractPanel>);
    },
});
