import lightVizClient       from '../../client';
import equals               from 'mout/src/array/equals';
import DoubleSliderElement  from 'tonic-ui/lib/react/widget/DoubleSliderElement';
import React                from 'react';
import ToggleButton         from 'tonic-ui/lib/react/widget/ToggleIconButton';
import ColorBy              from '../../widgets/ColorBy';
import Representation       from '../../widgets/Representation';

require('./style.css');

export default React.createClass({

    displayName: 'ContourPanel',

    propTypes: {
        bounds: React.PropTypes.array,
        dataset: React.PropTypes.object,
    },

    getDefaultProps() {
        return { bounds: [0,1,0,1,0,1] };
    },

    getInitialState() {
        return {
            xPosition: (this.props.bounds[0] + this.props.bounds[1])*0.5,
            yPosition: (this.props.bounds[2] + this.props.bounds[3])*0.5,
            zPosition: (this.props.bounds[4] + this.props.bounds[5])*0.5,
            xInsideOut: false,
            yInsideOut: false,
            zInsideOut: false,
            enabled: false,
        };
    },

    componentWillReceiveProps(nextProps) {
        var previous = this.props.bounds,
            next = nextProps.bounds;

        if(!equals(previous, next)) {
            this.setState({
                xPosition: (next[0] + next[1])*0.5,
                yPosition: (next[2] + next[3])*0.5,
                zPosition: (next[4] + next[5])*0.5,
            });
        }
    },

    updateColorBy(name, field) {
        lightVizClient.updateClipColor(field);
    },

    toggleEnable(enabled) {
        this.setState({enabled});
        lightVizClient.enableClip(enabled);
    },

    toggleInsideOut(onOff, name) {
        const {xInsideOut, yInsideOut, zInsideOut} = this.state,
            insideOut = {xInsideOut, yInsideOut, zInsideOut};

        this.setState({[name]:onOff});
        insideOut[name] = onOff;

        lightVizClient.updateClipInsideOut(insideOut.xInsideOut, insideOut.yInsideOut, insideOut.zInsideOut);
    },

    updateRepresentation(name, rep) {
        lightVizClient.updateRepresentation(name, rep);
    },

    positionChange(name, value) {
        const {xPosition, yPosition, zPosition} = this.state,
            pos = {xPosition, yPosition, zPosition};

        this.setState({[name]:value});

        // Update server
        pos[name] = value;
        lightVizClient.updateClipPosition(pos);
    },

    render() {
        return (<div className='ContourPanel'>
                    <ToggleButton value={ this.state.enabled } onChange={ this.toggleEnable }/>
                    <ColorBy dataset={ this.props.dataset } name='clip' onChange={ this.updateColorBy } />
                    <Representation name='clip' onChange={ this.updateRepresentation } />
                    <div className='ContourPanel_line'>
                        <ToggleButton
                            value={ this.state.xInsideOut }
                            icon='fa-toggle-on'
                            name='xInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <div style={{width: 'calc(100% - 35px)'}}>
                            <DoubleSliderElement
                                min={ this.props.bounds[0] }
                                max={ this.props.bounds[1] }
                                value={ this.state.xPosition }
                                name='xPosition' onChange={ this.positionChange } />
                        </div>
                    </div>
                    <div className='ContourPanel_line'>
                        <ToggleButton
                            value={ this.state.yInsideOut }
                            icon='fa-toggle-on'
                            name='yInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <div style={{width: 'calc(100% - 35px)'}}>
                            <DoubleSliderElement
                                min={ this.props.bounds[2] }
                                max={ this.props.bounds[3] }
                                value={ this.state.yPosition }
                                name='yPosition' onChange={ this.positionChange } />
                        </div>
                    </div>
                    <div className='ContourPanel_line'>
                        <ToggleButton
                            value={ this.state.zInsideOut }
                            icon='fa-toggle-on'
                            name='zInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <div style={{width: 'calc(100% - 35px)'}}>
                            <DoubleSliderElement
                                min={ this.props.bounds[4] }
                                max={ this.props.bounds[5] }
                                value={ this.state.zPosition }
                                name='zPosition' onChange={ this.positionChange } />
                        </div>
                    </div>
                </div>);
    },
});
