var React = require('react');

export default React.createClass({

    render() {
        return (
            <div className='ToolPanel Toolbar'>
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
