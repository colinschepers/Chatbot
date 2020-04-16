export default class BackendService {
  constructor() {
    this.baseUrl = "http://localhost:5000";
  }

  getHistory(callback, delayInMilliseconds) {
    let start = new Date().getTime();
    fetch(this.baseUrl + "/chatbot/history", {
        credentials: "include"
      })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('getHistory result: ' + result);
          let end = new Date().getTime();
          let elapsed = end - start;
          setTimeout(function () {
            callback(result);
          }, delayInMilliseconds - elapsed);
        }
      );
  }

  getWelcomeMessage(callback, delayInMilliseconds) {
    let start = new Date().getTime();
    fetch(this.baseUrl + "/chatbot/welcome", {
        credentials: "include"
      })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('getWelcomeMessage result: ' + result);
          let end = new Date().getTime();
          let elapsed = end - start;
          setTimeout(function () {
            callback(result);
          }, delayInMilliseconds - elapsed);
        }
      );
  }

  sendMessage(message, callback, delayInMilliseconds) {
    let start = new Date().getTime();
    fetch(this.baseUrl + "/chatbot/get?" + (message ? ("message=" + message) : ""), {
        credentials: "include"
      })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('sendMessage result: ' + result);
          let end = new Date().getTime();
          let elapsed = end - start;
          setTimeout(function () {
            callback(result);
          }, delayInMilliseconds - elapsed);
        }
      );
  }

  getData(callback) {
    fetch(this.baseUrl + "/chatbot/data", {
        credentials: "include"
      })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('getData result: ' + result);
          callback(result);
        }
      );
  }
}