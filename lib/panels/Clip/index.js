import lightVizClient       from '../../client';
import NumberSliderControl  from 'tonic-ui/lib/react/widget/NumberSliderControl';
import React                from 'react';
import ToggleButton         from 'tonic-ui/lib/react/widget/ToggleIconButton';

require('./style.css');

export default React.createClass({

    displayName: 'ClipPanel',

    getInitialState() {
        return {
            xPosition: 50,
            yPosition: 50,
            zPosition: 50,
            xInsideOut: false,
            yInsideOut: false,
            zInsideOut: false,
            enabled: false,
        };
    },

    updateColorBy(event) {
        lightVizClient.updateColor(event.target.value);
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

    positionChange(event) {
        const value = Number(event.target.value),
            name = event.target.name,
            {xPosition, yPosition, zPosition} = this.state,
            pos = {xPosition, yPosition, zPosition};

        this.setState({[name]:value});

        // Update server
        pos[name] = value;
        lightVizClient.updateClipPosition(pos);
    },

    render() {
        return (<div className='ClipPanel'>
                    <ToggleButton value={ this.state.enabled } onChange={ this.toggleEnable }/>
                    <div className='ClipPanel_line'>
                        <ToggleButton
                            value={ this.state.xInsideOut }
                            icon='fa-toggle-on'
                            name='xInsideOut'
                            onChange={ this.toggleInsideOut }
                            style={{width: '30px'}}/>
                        <div style={{width: 'calc(100% - 35px)'}}>
                            <NumberSliderControl min='0' max='100' step='1' value={ this.state.xPosition } name='xPosition' onChange={ this.positionChange } />
                        </div>
                    </div>
                    <div className='ClipPanel_line'>
                        <ToggleButton value={ this.state.yInsideOut } icon='fa-toggle-on' name='yInsideOut' onChange={ this.toggleInsideOut } style={{width: '30px'}}/>
                        <div style={{width: 'calc(100% - 35px)'}}>
                            <NumberSliderControl min='0' max='100' step='1' value={ this.state.yPosition } name='yPosition' onChange={ this.positionChange } />
                        </div>
                    </div>
                    <div className='ClipPanel_line'>
                        <ToggleButton value={ this.state.zInsideOut } icon='fa-toggle-on' name='zInsideOut' onChange={ this.toggleInsideOut } style={{width: '30px'}}/>
                        <div style={{width: 'calc(100% - 35px)'}}>
                            <NumberSliderControl min='0' max='100' step='1' value={ this.state.zPosition } name='zPosition' onChange={ this.positionChange } />
                        </div>
                    </div>
                </div>);
    },
});
