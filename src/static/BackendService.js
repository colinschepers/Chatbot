export default class BackendService {
  constructor() {
    this.baseUrl = "http://localhost:5000";
  }

  getHistory(callback) {
    this.doRequest(this.baseUrl + "/chatbot/history", callback);
  }

  getWelcomeMessage(callback, delayInMilliseconds) {
    this.doRequest(this.baseUrl + "/chatbot/welcome", callback, delayInMilliseconds);
  }

  sendMessage(message, callback, delayInMilliseconds) {
    let url = this.baseUrl + "/chatbot/get?" + (message ? ("message=" + message) : "");
    this.doRequest(url, callback, delayInMilliseconds);
  }

  getData(callback) {
    this.doRequest(this.baseUrl + "/chatbot/data", callback);
  }

  doRequest(url, callback, delayInMilliseconds = 0) {
    let start = new Date().getTime();
    fetch(url, {
        credentials: "include"
      })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log('url => ' + result);
          let end = new Date().getTime();
          let elapsed = end - start;
          setTimeout(function () {
            callback(result);
          }, delayInMilliseconds - elapsed);
        }
      );
  }
}