import os.path
import random
import json
import pickle
import scipy.spatial
import model
from datetime import datetime
from config import config
from logger import logger


class Chatbot:
    def __init__(self, name, messages, responses, match_threshold=0.6):
        self.name = name
        self.messages = messages
        self.message_embeddings = model.encode(messages)
        self.responses = responses
        self.match_threshold = match_threshold
        self.history = []

    def get_welcome_message(self):
        match = self.__get_match('WELCOME_MESSAGE')
        self.history.append({'isbotmessage': True, 'message': match['response'], 'date': str(datetime.utcnow())})
        return self.history[-1]

    def get_response(self, message):
        self.history.append({'isbotmessage': False, 'message': message, 'date': str(datetime.utcnow())})
        match = self.__get_match(message)
        self.history.append({'isbotmessage': True, 'message': match['response'], 'date': str(datetime.utcnow())})
        return self.history[-1]

    def add_training_example(self, message, response):
        self.messages.append(message)
        self.message_embeddings.append(model.encode([message])[0])
        self.responses.append(response)

    def __get_match(self, query):
        match = {"message": '', "response": '', "score": 0}

        if len(self.message_embeddings) > 0:
            query_embeddings = model.encode([query])
            distances = scipy.spatial.distance.cdist(query_embeddings, self.message_embeddings, "cosine")[0]
            results = zip(range(len(distances)), distances)
            results = sorted(results, key=lambda x: x[1])

            idx, distance = results[0]

            match = {
                "message": self.messages[idx],
                "response": self.responses[idx],
                "score": max(0, float(1.0 - distance))
            }

        if match['score'] < self.match_threshold:
            if self.name != default_chatbot.name:
                match = default_chatbot.__get_match(query)
            elif query != 'NO_MATCH':
                score = match['score']
                match = self.__get_match('NO_MATCH')
                match['score'] = score

        return match

    def write(self):
        path = os.path.join(config['DATA_PATH'], f'chatbot_{self.name}.pkl')
        with open(path, 'wb') as f:
            pickle.dump(self.name, f)
            pickle.dump(self.messages, f)
            pickle.dump(self.responses, f)

    @staticmethod
    def load_by_name(name):
        if name not in chatbot_cache:
            chatbot_cache[name] = Chatbot(name, [], [])
        return chatbot_cache[name]

    @staticmethod
    def load_from_file(name):
        path = os.path.join(config['DATA_PATH'], f'chatbot_{name}.pkl')
        with open(path, 'rb') as f:
            name = pickle.load(f)
            messages = pickle.load(f)
            responses = pickle.load(f)
        return Chatbot(name, messages, responses)


chatbot_cache = {}
default_chatbot = Chatbot.load_from_file('default')
