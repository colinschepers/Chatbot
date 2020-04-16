import sys
import os
import time
import uuid
import json
import psutil
import argparse
import werkzeug
from datetime import datetime
from flask import Flask, request, session, send_from_directory
from flask_restful import reqparse
from config import config
from logger import logger
from chatbot import Chatbot


identifier = str(uuid.uuid4())
created = str(datetime.utcnow())
app = Flask(__name__)
app.debug = config["DEBUG"]
app.secret_key = config["SECRET_KEY"]
app.config['SESSION_TYPE'] = 'memcached'


@app.route('/')
def root():
    return json.dumps({"message": "Welcome to the EasyChatbot API!"})


@app.route('/chatbot/welcome')
def chatbot_welcome():
    history = session['history'] = session['history'] if 'history' in session else []
    chatbot = Chatbot.load_by_name('default')
    message = chatbot.get_response('[WELCOME_MESSAGE]')
    history.append({'isbotmessage': True, 'message': message, 'date': str(datetime.utcnow())})
    return app.response_class(response=json.dumps(history[-1]), status=200, mimetype='application/json')


@app.route('/chatbot/get')
def chatbot_get():
    parser = reqparse.RequestParser()
    parser.add_argument('message', type=str, required=False)
    args = parser.parse_args()

    history = session['history'] = session['history'] if 'history' in session else []
    chatbot = Chatbot.load_by_name('default')

    if args.message:
        if history and history[-1]['isbotmessage']:
            message = history[-1]['message']
            chatbot.add(message, args.message)
        history.append({'isbotmessage': False, 'message': args.message, 'date': str(datetime.utcnow())})

    message = chatbot.get_training_message()
    history.append({'isbotmessage': True, 'message': message, 'date': str(datetime.utcnow())})
    return app.response_class(response=json.dumps(history[-1]), status=200, mimetype='application/json')


@app.route('/chatbot/data')
def chatbot_data():
    chatbot = Chatbot.load_by_name('default')
    data = [{"message": item[0], "normalized_message": item[1], "response": item[2]}
            for item in zip(chatbot.messages, chatbot.normalized_messages, chatbot.responses)]
    return app.response_class(response=json.dumps(data), status=200, mimetype='application/json')


@app.route('/chatbot/history')
def chatbot_history():
    history = session['history'] = session['history'] if 'history' in session else []
    return app.response_class(response=json.dumps(history), status=200, mimetype='application/json')


@app.route('/status')
def get_status():
    return app.response_class(response=json.dumps({
        "identifier": identifier,
        "created": created,
        "memory": f'{(psutil.Process().memory_info().rss / 1000000):.0f}MB',
    }), status=200, mimetype='application/json')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.after_request
def after_request_func(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


if __name__ == '__main__':
    app.run(host=config["HOST"], port=config["PORT"], debug=config["DEBUG"], threaded=True, use_reloader=False)
