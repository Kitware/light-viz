var React = require('react');

export default React.createClass({

    render() {
        var timeValue = 0.0;
        return (
            <div className='TitlePanel Toolbar'>
                <b>LightViz</b>
                <i className='fa fa-fw fa-spinner fa-spin'></i>
                <select>
                    <option>Solid</option>
                    <option>Temperature</option>
                    <option>Pressure</option>
                    <option>Velocity</option>
                    <option>Displacement</option>
                </select>
            </div>
        );
    }
});
