import React, { Component } from 'react';
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


class ChatApp extends Component {
  constructor(props) {
    super(props);
    this.state = { "messages": [], "current_message": "" }
    this.handleClick = this.handleClick.bind(this);
    this._handleKeyPress = this._handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addMessageBox = this.addMessageBox.bind(this);
    this.loadHistory();
  }

  addMessageBox(enter = true) {
    let messages = this.state.messages;
    let current_message = this.state.current_message;
    //console.log(this.state);
    if (current_message && enter) {
      messages = [...messages, { "message": current_message }];
      this.sendMessage(current_message, messages);
      current_message = ""
    }
    this.setState({
      current_message: current_message,
      messages
    });
  }

  loadHistory() {
    fetch("http://localhost:5000/chatbot/history", { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          console.log('history result: ' + result);
          this.setState({
            messages: result
          });
          this.getWelcomeMessage(this.state.messages);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getWelcomeMessage(messages) {
    fetch("http://localhost:5000/chatbot/welcome", { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            messages: [...messages, result]
          });
        },
        (error) => {
          console.error(error);
        }
      );
  }

  sendMessage(message, messages) {
    fetch("http://localhost:5000/chatbot/sendmessage?message=" + message, { credentials: "include" })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            messages: [...messages, result]
          });
        },
        (error) => {
          console.error(error);
        }
      );
  }

  handleClick() {
    this.addMessageBox();
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

export default ChatApp;