export default class BackendService {
  welcome_messages = [
    "Hello, how are you?",
    "Hi, how are you doing today?",
    "Hello, can I help you?"
  ]
  no_answer_messages = [
    "I'm sorry, I am just a mock Chatbot. My backend is missing!",
    "I can't repond to that because I'm just a mock.",
    "Yeah, I'm not sure how to answer that..."
  ]
  data = [{
    questions: [
      "Hello, how are you?",
      "Hi, what's up?"
    ],
    answers: [
      "Great, how are you?",
      "I'm good, how are you doing today?"
    ],
    is_suggestion: false
  }, {
    questions: [
      "I would like to get in contact",
      "Where can I reach you?"
    ],
    answers: [
      "I am your only help...",
      "I'm sorry, there is no customer service. It's just you and me..."
    ],
    is_suggestion: false
  }, {
    questions: [
      "How old are you?"
    ],
    answers: [
      "55, and you?",
      "I'm 44, why is that relevant?"
    ],
    is_suggestion: true
  }];
  history = [];

  sendMessage(message, callback, delayInMilliseconds) {
    if (message) {
      this.history.push(message);
    }
    var matches = this.no_answer_messages;
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
    callback(this.history.slice());
  }

  getData(callback) {
    callback(this.data);
  }
}