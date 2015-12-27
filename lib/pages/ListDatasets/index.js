import React            from 'react';
import ReactDOM         from 'react-dom';
import { Link }         from 'react-router';
import lightVizClient   from '../../client';

export default React.createClass({

    displayName: 'ListDatasets',

    getInitialState() {
        return {
            datasets: [],
        };
    },

    componentDidMount() {
       this.refresh();
    },

    componentDidUpdate() {
        // Load thumbnails
        const images = ReactDOM.findDOMNode(this).querySelectorAll('img');
        let count = images.length;
        while(count--) {
            lightVizClient.addThumbnail(images[count]);
        }
    },

    refresh() {
        lightVizClient.listDatasets( datasets => this.setState({ datasets }) );
    },

    render() {
        return (<div><div>List datasets <span onClick={ this.refresh }> Refresh </span></div> <ul>
            { this.state.datasets.map(function(ds) {
                return <li key={ds.name}><img data-name={ds.name}/><Link to={"/view/" + ds.name} > {ds.name} </Link></li>;
            })}
            </ul></div>);
    },
});
