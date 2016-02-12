import equals               from 'mout/src/array/equals';
import clone                from 'mout/src/lang/clone';
import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import ToggleButton         from 'tonic-ui/lib/react/widget/ToggleIconButton';
import AbstractPanel        from '../AbstractPanel';

import {
    getState,
    updateSlicesVisible,
    updateSlicePosition,
} from '../../client';

require('./style.css');

export default React.createClass({

    displayName: 'SlicePanel',

    propTypes: {
        dataset: React.PropTypes.object,
    },

    getDefaultProps() {
        return { dataset: { data: { bounds: [0,1,0,1,0,1] } } };
    },

    getInitialState() {
        this.oldState = {
            xPosition: (this.props.dataset.data.bounds[0] + this.props.dataset.data.bounds[1])*0.5,
            yPosition: (this.props.dataset.data.bounds[2] + this.props.dataset.data.bounds[3])*0.5,
            zPosition: (this.props.dataset.data.bounds[4] + this.props.dataset.data.bounds[5])*0.5,
            xVisible: false,
            yVisible: false,
            zVisible: false,
        };
        return clone(this.oldState);
    },

    componentDidMount() {
        getState('slice', this, this._modulePanel);
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

    toggleSliceVisible(onOff, name) {
        const {xVisible, yVisible, zVisible} = this.state,
            visible = {xVisible, yVisible, zVisible};

        this.setState({[name]:onOff});
        visible[name] = onOff;

        if (this.props.dataset.autoApply) {
            updateSlicesVisible(visible.xVisible, visible.yVisible, visible.zVisible);
        }
    },

    positionChange(name, value) {
        const {xPosition, yPosition, zPosition} = this.state,
            pos = {xPosition, yPosition, zPosition};

        this.setState({[name]:value});

        // Update server
        pos[name] = value;
        if (this.props.dataset.autoApply) {
            updateSlicePosition(pos);
        }
    },

    onApply() {
        const {xPosition, yPosition, zPosition} = this.state,
            pos = {xPosition, yPosition, zPosition};

        updateSlicesVisible(this.state.xVisible, this.state.yVisible, this.state.zVisible);
        updateSlicePosition(pos);
        this.oldState = clone(this.state);
    },

    onReset() {
        this.setState(this.oldState);
    },

    render() {
        return (<AbstractPanel ref={(c) => { this._modulePanel = c }}
                             name='slice'
                             dataset={this.props.dataset}
                             onApply={this.onApply}
                             onReset={this.onReset}
                             moduleName='Slice'>
                    <div className='SlicePanel_line'>
                        <ToggleButton
                            alwaysOn
                            value={ this.state.xVisible }
                            icon={'fa-toggle-' + (this.state.xVisible ? 'on' : 'off')}
                            name='xVisible'
                            onChange={ this.toggleSliceVisible }
                            style={{width: '30px'}}/>
                        <DoubleSliderElement
                            min={ this.props.dataset.data.bounds[0] }
                            max={ this.props.dataset.data.bounds[1] }
                            value={ this.state.xPosition }
                            name='xPosition' onChange={ this.positionChange } />
                    </div>
                    <div className='SlicePanel_line'>
                        <ToggleButton
                            alwaysOn
                            value={ this.state.yVisible }
                            icon={'fa-toggle-' + (this.state.yVisible ? 'on' : 'off')}
                            name='yVisible'
                            onChange={ this.toggleSliceVisible }
                            style={{width: '30px'}}/>
                        <DoubleSliderElement
                            min={ this.props.dataset.data.bounds[2] }
                            max={ this.props.dataset.data.bounds[3] }
                            value={ this.state.yPosition }
                            name='yPosition' onChange={ this.positionChange } />
                    </div>
                    <div className='SlicePanel_line'>
                        <ToggleButton
                            alwaysOn
                            value={ this.state.zVisible }
                            icon={'fa-toggle-' + (this.state.zVisible ? 'on' : 'off')}
                            name='zVisible'
                            onChange={ this.toggleSliceVisible }
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
