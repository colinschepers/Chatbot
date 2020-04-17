export default class BackendService {
  data = [{
      message: "[WELCOME_MESSAGE]",
      normalized_message: "[WELCOME_MESSAGE]",
      response: "Hello, how are you?"
    },
    {
      message: "[WELCOME_MESSAGE]",
      normalized_message: "[WELCOME_MESSAGE]",
      response: "Hi, how are you doing today?"
    },
    {
      message: "[WELCOME_MESSAGE]",
      normalized_message: "[WELCOME_MESSAGE]",
      response: "Hello, can I help you?"
    },
    {
      message: "[NO_MATCH]",
      normalized_message: "[NO_MATCH]",
      response: "I'm sorry, I am just a mock Chatbot. My backend is missing!"
    },
    {
      message: "[NO_MATCH]",
      normalized_message: "[NO_MATCH]",
      response: "I can't repond to that because I'm just a mock."
    },
    {
      message: "[NO_MATCH]",
      normalized_message: "[NO_MATCH]",
      response: "Yeah, I'm not sure how to answer that..."
    },
    {
      message: "Hello, how are you?",
      normalized_message: "hello how are you",
      response: "Great, how are you?"
    },
    {
      message: "What are your hobbies?",
      normalized_message: "what are your hobbies",
      response: "I like to play tennis. What about you?"
    }
  ];
  history = [];

  getWelcomeMessage(callback, delayInMilliseconds) {
    var matches = this.data.filter((x) => x.message === '[WELCOME_MESSAGE]');
    let result = {
      isbotmessage: true,
      message: matches[Math.floor(Math.random() * matches.length)].response,
      date: new Date().toISOString()
    };
    setTimeout(function () {
      this.history.push(result);
      callback(result);
    }.bind(this), delayInMilliseconds);
  }

  sendMessage(message, callback, delayInMilliseconds) {
    this.history.push(message);
    var matches = this.data.filter((x) => x.message === '[NO_MATCH]');
    let result = {
      isbotmessage: true,
      message: matches[Math.floor(Math.random() * matches.length)].response,
      date: new Date().toISOString()
    };
    setTimeout(function () {
      this.history.push(result);
      callback(result);
    }.bind(this), delayInMilliseconds);
  }

  getHistory(callback) {
    callback(this.history);
  }

  getData(callback) {
    callback(this.data);
  }
}