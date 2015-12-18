var React = require('react'),
    TitleBar = require('./title.js'),
    ControlBar = require('./tools.js'),
    Renderer = require('./renderer.js'),
    TimeBar = require('./time.js');

require('./style.css');

export default React.createClass({

  render() {
    var client = this.props.client,
        connection = this.props.connection;
    return (
        <div className='LightViz-app'>
            <TitleBar   client={ client } connection={ connection }/>
            <ControlBar client={ client } connection={ connection }/>
            <Renderer   client={ client } connection={ connection }/>
            <TimeBar    client={ client } connection={ connection }/>
        </div>
    );
  }
});
