import sys
import os
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
    return json.dumps({"message": "Welcome to the Chatbot API!"})


@app.route('/chatbot/test/welcome')
def chatbot_test_welcome():
    history = session['test_history'] = session['test_history'] if 'test_history' in session else []
    chatbot = Chatbot.load_by_name('default')
    message = chatbot.get_response('[TEST_WELCOME_MESSAGE]')
    history.append({'isbotmessage': True, 'message': message, 'date': str(datetime.utcnow())})
    return app.response_class(response=json.dumps(history[-1]), status=200, mimetype='application/json')


@app.route('/chatbot/test/get')
def chatbot_test_get():
    parser = reqparse.RequestParser()
    parser.add_argument('message', type=str, required=True, help="parameter message has to be provided")
    args = parser.parse_args()

    history = session['test_history'] = session['test_history'] if 'test_history' in session else []
    history.append({'isbotmessage': False, 'message': args.message, 'date': str(datetime.utcnow())})
    chatbot = Chatbot.load_by_name('default')
    message = chatbot.get_response(args.message)
    history.append({'isbotmessage': True, 'message': message, 'date': str(datetime.utcnow())})
    return app.response_class(response=json.dumps(history[-1]), status=200, mimetype='application/json')


@app.route('/chatbot/test/history')
def chatbot_test_history():
    history = session['test_history'] = session['test_history'] if 'test_history' in session else []
    return app.response_class(response=json.dumps(history), status=200, mimetype='application/json')


@app.route('/chatbot/train/welcome')
def chatbot_train_welcome():
    history = session['train_history'] = session['train_history'] if 'train_history' in session else []
    chatbot = Chatbot.load_by_name('default')
    message = chatbot.get_response('[TRAINING_WELCOME_MESSAGE]')
    history.append({'isbotmessage': True, 'message': message, 'date': str(datetime.utcnow())})
    return app.response_class(response=json.dumps(history[-1]), status=200, mimetype='application/json')


@app.route('/chatbot/train/get')
def chatbot_train_get():
    parser = reqparse.RequestParser()
    parser.add_argument('message', type=str, required=False, help="parameter message has to be provided")
    args = parser.parse_args()

    history = session['train_history'] = session['train_history'] if 'train_history' in session else []
    chatbot = Chatbot.load_by_name('default')

    if args.message:
        if history and history[-1]['isbotmessage']:
            message = history[-1]['message']
            chatbot.add(message, args.message)
        history.append({'isbotmessage': False, 'message': args.message, 'date': str(datetime.utcnow())})

    message = chatbot.get_training_message()
    history.append({'isbotmessage': True, 'message': message, 'date': str(datetime.utcnow())})
    return app.response_class(response=json.dumps(history[-1]), status=200, mimetype='application/json')


@app.route('/chatbot/train/history')
def chatbot_train_history():
    history = session['train_history'] = session['train_history'] if 'train_history' in session else []
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
