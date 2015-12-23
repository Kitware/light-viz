import * as React from 'react';
import { Link } from 'react-router';
import lightVizClient from '../../client';

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

    refresh() {
        lightVizClient.listDatasets( datasets => this.setState({ datasets }) );
    },

    render() {
        return (<div><div>List datasets <span onClick={ this.refresh }> Refresh </span></div> <ul>
            { this.state.datasets.map(function(ds) {
                return <li key={ds.name}><Link to={"/view/" + ds.name} > {ds.name} </Link></li>;
            })}
            </ul></div>);
    },
});
