import os.path
import pickle
import normalization
from logger import logger
from config import config
from data_structures import LimitedSizeDict
from sentence_transformers import SentenceTransformer


sentence_transformer = SentenceTransformer(config['MODEL_NAME'])


def encode(texts):
    if not sentence_transformer:
        logger.warning('Unable to encode because the model was not correctly loaded')
        return []
    if len(texts) == 0:
        return []

    logger.debug(f'Starting normalization of {len(texts)} texts')
    texts = [normalization.normalize(text) for text in texts]
    new_texts = [text for text in texts if text not in encoding_cache]

    if len(new_texts) > 0:
        logger.debug(f'Encoding {len(new_texts)} texts')
        new_embeddings = sentence_transformer.encode(new_texts)
        encoding_cache.update(zip(new_texts, new_embeddings))

    save_encoding_cache()

    return [encoding_cache[text] for text in texts]


def load_encoding_cache():
    path = os.path.join(config['DATA_PATH'], 'encoding_cache.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f:
            cache = LimitedSizeDict(size_limit=1000000)
            cache.update(pickle.load(f))
            return cache
    return LimitedSizeDict(size_limit=1000000)


def save_encoding_cache():
    path = os.path.join(config['DATA_PATH'], 'encoding_cache.pkl')
    with open(path, 'wb') as f:
        pickle.dump({key: encoding_cache[key] for key in encoding_cache.keys()}, f)


encoding_cache = load_encoding_cache()
