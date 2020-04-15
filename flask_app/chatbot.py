import os.path
import random
import json
import re
import scipy.spatial
import model
import normalization
from datetime import datetime
from config import config
from logger import logger
from core import is_keyword


chatbot_cache = {}


class Chatbot:
    def __init__(self, name, messages=[], responses=[], training_examples=[], match_threshold=0.6):
        self.name = name
        self.messages = messages
        self.normalized_messages = normalization.normalize_multiple(messages)
        self.message_embeddings = model.encode(self.normalized_messages)
        self.responses = responses
        self.training_examples = training_examples
        self.match_threshold = match_threshold
        self.save_to_file()

    def get_response(self, message):
        normalized_message = normalization.normalize(message)
        match = self.get_match(normalized_message)

        if not is_keyword(message):
            self.training_examples.append({
                "message": message,
                "normalized_message": normalized_message,
                'response': match['response'],
                "score": match['score']
            })

        if match['score'] < self.match_threshold:
            return self.get_match('[NO_MATCH]')['response']

        return match['response']

    def get_match(self, message):
        match = {"message": '', "response": '', "score": 0}

        if len(self.message_embeddings) > 0:
            message_embeddings = model.encode([message])
            distances = scipy.spatial.distance.cdist(message_embeddings, self.message_embeddings, "cosine")[0]
            results = zip(range(len(distances)), distances)
            results = sorted(results, key=lambda x: x[1])

            idx, distance = results[0]

            match = {
                "message": self.messages[idx],
                "response": self.responses[idx],
                "score": max(0, float(1.0 - distance))
            }

        return match

    def get_training_message(self):
        if self.training_examples:
            self.training_examples = sorted(self.training_examples, key=lambda x: x['score'])
            result = self.training_examples[0]
            self.training_examples = [item for item in self.training_examples if item['normalized_message'] != result['normalized_message']]
            return result['message']
        return self.get_match('[NO_TRAINING]')['response']

    def add(self, message, response):
        normalized_message = normalization.normalize(message)
        self.messages.append(message)
        self.normalized_messages.append(normalized_message)
        self.message_embeddings.append(model.encode([normalized_message])[0])
        self.responses.append(response)
        self.save_to_file()

    def save_to_file(self):
        path = os.path.join(config['DATA_PATH'], f'chatbot_{self.name}.json')
        with open(path, 'w') as f:
            f.write(json.dumps({
                'name': self.name,
                'data': [{
                    'message': self.messages[i],
                    'response': self.responses[i]
                } for i in range(len(self.messages))],
                'training_examples': self.training_examples,
                'match_threshold': self.match_threshold,
            }))

    @staticmethod
    def load_by_name(name):
        if name not in chatbot_cache:
            chatbot_cache[name] = Chatbot.load_from_file(name) or Chatbot.create_new(name) or Chatbot(name)
        return chatbot_cache[name]

    @staticmethod
    def load_from_file(name):
        path = os.path.join(config['DATA_PATH'], f'chatbot_{name}.json')
        if os.path.exists(path):
            with open(path, 'r') as f:
                obj = json.load(f)
            messages = [item['message'] for item in obj['data']]
            responses = [item['response'] for item in obj['data']]
            return Chatbot(obj['name'], messages, responses, obj['training_examples'], obj['match_threshold'])
        return None

    @staticmethod
    def create_new(name):
        chatbot = Chatbot.load_from_file('base')
        chatbot.name = name
        return chatbot
