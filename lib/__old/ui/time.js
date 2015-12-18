var React = require('react');
var NumberSliderControl = require('tonic-ui/lib/react/widget/NumberSliderControl');

export default React.createClass({

    getInitialState() {
        return { timeIdx: 0 };
    },

    updateSlider(e) {
        this.setState({timeIdx: Number(e.target.value) });
    },

    render() {
        var timeValue = 0.0;
        return (
            <div className='TimePanel Toolbar'>
                <b>Time: {timeValue}</b>
                <NumberSliderControl value={ this.state.timeIdx } min={0} max={10} onChange={ this.updateSlider }/>
                <i className='fa fa-fw fa-fast-backward'></i>
                <i className='fa fa-fw fa-step-backward'></i>
                <i className='fa fa-fw fa-play'></i>
                <i className='fa fa-fw fa-stop'></i>
                <i className='fa fa-fw fa-step-forward'></i>
                <i className='fa fa-fw fa-fast-forward'></i>
            </div>
        );
    }
});
