import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './App.css';
import './static/css/chat_interface.css';
import './static/css/temporary.css';
//import { callbackify } from 'util';

class SendButton extends Component {
  render() {
    return (<div className="send_message" onClick={this.props.handleClick}>
      <div className="text">send</div>
    </div>);
  }
}

class MessageTextBoxContainer extends Component {
  render() {
    return (
      <div className="message_input_wrapper">
        <input id="msg_input" className="message_input" placeholder="Type your message here..." value={this.props.message} onChange={this.props.onChange} onKeyPress={this.props._handleKeyPress} />
      </div>
    );
  }
}

class Avatar extends Component {
  render() {
    return (
      <div className="avatar" />
    );
  }
}

class MessageBox extends Component {
  render() {
    return (
      <li className={`message ${this.props.appearance} appeared`}>
        <Avatar></Avatar>
        <div className="text_wrapper">
          <div className="text">{this.props.message}</div>
        </div>
      </li>
    );
  }
}

class MessagesContainer extends Component {
  constructor(props) {
    super(props);
    this.createBotMessages = this.createBotMessages.bind(this);
  }

  scrollToBottom = () => {
    var el = this.refs.scroll;
    el.scrollTop = el.scrollHeight;
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  createBotMessages() {
    //console.log(this.props.messages);
    return this.props.messages.map((message, index) =>
      <MessageBox key={index} message={message["message"]} appearance={message["isbotmessage"] ? "left" : "right"} />
    );
  }

  render() {
    return (
      <ul className="messages" ref="scroll">
        {this.createBotMessages()}
      </ul>
    );
  }
}


class ChatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { "messages": [], "current_message": "" }
    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onLoad();
  }

  addMessageBox(enter = true) {
    let messages = this.state.messages;
    let current_message = this.state.current_message;
    if (current_message && enter) {
      messages = [...messages, { "message": current_message }];

      let start = new Date().getTime();
      this.sendMessage(current_message, (result) => {
        let delayInMilliseconds = 300 + 5 * result['message'].length;
        let end = new Date().getTime();
        let elapsed = end - start;
        setTimeout(function () {
          this.setState({
            messages: [...this.state.messages, result]
          });
        }.bind(this), delayInMilliseconds - elapsed);
      });

      current_message = ""
    }
    this.setState({
      current_message: current_message,
      messages
    });
  }

  getHistory(callback) {
    fetch("http://localhost:5000/chatbot/" + this.props.name + "/history", { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('getHistory result: ' + this.state.messages);
          this.setState({
            messages: result
          });
          callback(result);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getWelcomeMessage(callback) {
    fetch("http://localhost:5000/chatbot/" + this.props.name + "/welcome", { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('getWelcomeMessage result: ' + this.state.messages);
          callback(result);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  sendMessage(message, callback) {
    let url = "http://localhost:5000/chatbot/" + this.props.name + "/get?";
    let queryParams = message ? ("message=" + message) : "";

    fetch(url + queryParams, { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log(result);
          callback(result);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  handleClick() {
    this.addMessageBox();
  }

  onLoad(e) {
  }

  onChange(e) {
    this.setState({
      current_message: e.target.value
    });
  }

  _handleKeyPress(e) {
    let enter_pressed = false;
    if (e.key === "Enter") {
      enter_pressed = true;
    }
    this.addMessageBox(enter_pressed)
  }

  render() {
    return (
      <div className="chat_window">
        <MessagesContainer messages={this.state.messages}></MessagesContainer>
        <div className="bottom_wrapper clearfix">
          <MessageTextBoxContainer
            _handleKeyPress={this._handleKeyPress}
            onChange={this.onChange}
            message={this.state.current_message}></MessageTextBoxContainer>
          <SendButton handleClick={this.handleClick}></SendButton>
        </div>
      </div>
    );
  }
}

class TestChatContainer extends ChatContainer {
  onLoad(e) {
    this.getHistory((result) => {
      this.setState({
        messages: result
      });
      this.getWelcomeMessage((result) => {
        this.setState({
          messages: [...this.state.messages, result]
        });
      });
    });
  }
}

class TrainChatContainer extends ChatContainer {
  onLoad(e) {
    this.getHistory((result) => {
      this.setState({
        messages: result
      });
      this.getWelcomeMessage((result) => {
        this.setState({
          messages: [...this.state.messages, result]
        });
        this.sendMessage('', (result) => {
          this.setState({
            messages: [...this.state.messages, result]
          });
        });
      });
    });
  }
}

class App extends Component {
  render() {
    return (
      <Tabs>
        <TabList>
          <Tab>Train</Tab>
          <Tab>Test</Tab>
        </TabList>
        <TabPanel>
          <TrainChatContainer name="train" />
        </TabPanel>
        <TabPanel>
          <TestChatContainer name="test" />
        </TabPanel>
      </Tabs>
    );
  }
}

export default App;