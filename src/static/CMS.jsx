import React, { Component } from 'react';
import BackendService from './BackendService.js';
import './css/cms.css';

var backendService = new BackendService();

class DataItem extends Component {
    render() {
        return (
            <li className="data_item appeared">
                <div className="message text_wrapper">
                    <div className="text">{this.props.message}</div>
                </div>
                <div className="response text_wrapper">
                    <div className="text">{this.props.response}</div>
                </div>
            </li>
        );
    }
}

class DataContainer extends Component {
    constructor(props) {
        super(props);
        this.createDataItems = this.createDataItems.bind(this);
    }

    scrollToTop = () => {
        var el = this.refs.scroll;
        el.scrollTop = 0;
    }

    componentDidMount() {
        this.scrollToTop();
    }

    createDataItems() {
        return this.props.data.map((item, index) =>
            <DataItem key={index} message={item["message"]} response={item["response"]} />
        );
    }

    render() {
        return (
            <ul className="data" ref="scroll">
                {this.createDataItems()}
            </ul>
        );
    }
}

class CMS extends Component {
    _isMounted = true;

    constructor(props) {
        super(props);
        this.state = { "data": [] }
    }

    componentDidMount() {
        this._isMounted = true;
        backendService.getData((result) => {
            if (this._isMounted) {
                this.setState({
                    data: result
                });
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <div className="cms_window">
                <DataContainer data={this.state.data}></DataContainer>
            </div>
        );
    }
}

export default CMS;