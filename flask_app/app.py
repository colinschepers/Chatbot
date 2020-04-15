import sys
import os
import uuid
import datetime
import json
import psutil
import argparse
import werkzeug
from flask import Flask, request, session, send_from_directory
from flask_restful import reqparse
from config import config
from logger import logger
from chatbot import Chatbot


identifier = str(uuid.uuid4())
created = str(datetime.datetime.utcnow())
app = Flask(__name__)
app.debug = config["DEBUG"]
app.secret_key = config["SECRET_KEY"]
app.config['SESSION_TYPE'] = 'memcached'


@app.route('/')
def root():
    return json.dumps({"message": "Welcome to the Chatbot API!"})


@app.route('/chatbot/welcome')
def chatbot_welcome():
    session_id = session['id'] = session['id'] if 'id' in session else str(uuid.uuid4())
    chatbot = Chatbot.load_by_name(session_id)
    reply = chatbot.get_welcome_message()
    return app.response_class(response=json.dumps(reply), status=200, mimetype='application/json')


@app.route('/chatbot/sendmessage')
def chatbot_sendmessage():
    parser = reqparse.RequestParser()
    parser.add_argument('message', type=str, required=True, help="parameter message has to be provided")
    args = parser.parse_args()

    session_id = session['id'] = session['id'] if 'id' in session else str(uuid.uuid4())
    chatbot = Chatbot.load_by_name(session_id)
    reply = chatbot.get_response(args.message)
    return app.response_class(response=json.dumps(reply), status=200, mimetype='application/json')


@app.route('/chatbot/train')
def chatbot_train():
    parser = reqparse.RequestParser()
    parser.add_argument('message', type=str, required=True, help="parameter message has to be provided")
    parser.add_argument('response', type=str, required=True, help="parameter message has to be provided")
    args = parser.parse_args()

    session_id = session['id'] = session['id'] if 'id' in session else str(uuid.uuid4())
    chatbot = Chatbot.load_by_name(session_id)
    reply = chatbot.add_training_example(args.message, args.response)
    return app.response_class(response=json.dumps(reply), status=200, mimetype='application/json')


@app.route('/chatbot/history')
def chatbot_history():
    session_id = session['id'] = session['id'] if 'id' in session else str(uuid.uuid4())
    chatbot = Chatbot.load_by_name(session_id)
    return app.response_class(response=json.dumps(chatbot.history), status=200, mimetype='application/json')


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


@app.before_request
def validate_machine_key():
    if request.endpoint == 'favicon' or app.env == 'development':
        return

    parser = reqparse.RequestParser()
    parser.add_argument('machinekey', type=str, required=True, help="parameter machinekey has to be provided")
    parser.add_argument('machinekey', type=str, required=True, help="parameter machinekey is invalid", choices=([config["MACHINE_KEY"]]))
    parser.parse_args()


@app.after_request
def after_request_func(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


if __name__ == '__main__':
    app.run(host=config["HOST"], port=config["PORT"], debug=config["DEBUG"], threaded=True, use_reloader=False)
