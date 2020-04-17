import React, { Component } from 'react';
import BackendService from './MockBackendService.js';
import './css/cms.css';

var backendService = new BackendService();

class DataItem extends Component {
    render() {
        return (
            <li className="data_item appeared">
                <div className="message" >
                    <div className="text">{this.props.message}</div>
                </div>
                <div className="response" >
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
            <DataItem key={index}
                message={item["message"]}
                normalized_message={item["normalized_message"]}
                response={item["response"]} />
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

class FilterTextBoxContainer extends Component {
    render() {
        return (
            <div className="filter_input_wrapper">
                <input
                    className="filter_input"
                    placeholder="Type here to filter..."
                    value={this.props.filter}
                    onChange={this.props.onChange} />
            </div>
        );
    }
}

class RefreshButton extends Component {
    render() {
        return (<div className="refresh_button" onClick={this.props.handleClick}>
            <div className="text">refresh data</div>
        </div>);
    }
}

class CMS extends Component {
    _isMounted = true;

    constructor(props) {
        super(props);
        this.state = { "data": [], "filtered_data": [], "current_filter": "" }
        this.onFilterChange = this.onFilterChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.loadData = this.loadData.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;
        this.loadData();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onFilterChange(e) {
        let filter = e.target.value;
        let filterWords = filter.toLowerCase().split(" ");
        let filtered_data = this.state.data.filter((item) => {
            return filterWords.every(filterWord =>
                item.message.toLowerCase().includes(filterWord)
                || item.normalized_message.toLowerCase().includes(filterWord)
                || item.response.toLowerCase().includes(filterWord)
            );
        });
        this.setState({ filtered_data: filtered_data, current_filter: filter });
    }

    handleClick() {
        this.setState({
            current_filter: ''
        });
        this.loadData();
    }

    loadData() {
        backendService.getData((result) => {
            if (this._isMounted) {
                this.setState({
                    data: result,
                    filtered_data: result
                });
            }
        });
    }

    render() {
        return (
            <div className="cms_window">
                <DataContainer data={this.state.filtered_data}></DataContainer>
                <div className="bottom_wrapper clearfix">
                    <FilterTextBoxContainer
                        onChange={this.onFilterChange}
                        filter={this.state.current_filter}></FilterTextBoxContainer>
                    <RefreshButton handleClick={this.handleClick}></RefreshButton>
                </div>
            </div>
        );
    }
}

export default CMS;