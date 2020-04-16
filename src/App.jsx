import React, { Component } from 'react';
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import deepOrange from '@material-ui/core/colors/deepOrange';
import Chatbot from './static/Chatbot.jsx';
import CMS from './static/CMS.jsx';
import Statistics from './static/Statistics.jsx';
import Configuration from './static/Configuration.jsx';
import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: deepOrange,
    secondary: deepOrange,
  },
  overrides: {
    MuiTab: {
      root: {
        "&:hover": {
          backgroundColor: '#ffda99',
          borderRadius: 15
        }
      }
    }
  }
});

const tab_contents = [
  <Chatbot label="Chatbot" />,
  <CMS label="CMS" />,
  <Statistics label="Statistics" />,
  <Configuration label="Configuration" />
]

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "user_name": "Guest",
      "selectedTab": 0
    }
  }

  handleChange = (event, value) => {
    this.setState({ "selectedTab": value });
  };

  getTabs() {
    return tab_contents.map((tab, idx) => <Tab key={idx} label={tab.props.label} />)
  }

  getTabContent() {
    return tab_contents.map((tab, idx) =>
      <div key={idx} style={{ display: idx === this.state.selectedTab ? 'block' : 'none' }}>
        {tab}
      </div>
    );
  }

  render() {
    return (
      <div className="app">
        <MuiThemeProvider theme={theme}>
          <AppBar className="appbar" position="static" color="default">
            <Tabs
              indicatorColor="primary"
              textColor="secondary"
              variant="fullWidth"
              value={this.state.selectedTab}
              onChange={this.handleChange} >
              {this.getTabs()}
            </Tabs>
          </AppBar>
          <div className="content">
            {this.getTabContent()}
          </div>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;