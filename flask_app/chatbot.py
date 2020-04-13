import random

replies = [
    'That is nice to hear.',
    'Cool, tell me more.',
    'I feel exactly the same!',
    'I don\'t understand, can you rephrase that?',
    'Yes, ofcourse...',
    'Why are you so mean!',
    'Thank you, you are so kind!'
]


def get_reply(message, session):
    history = session['history'] if 'history' in session else []

    if message == 'SESSION_START':
        reply = 'Hello, nice to meet you!' if len(history) == 0 else 'Hi, welcome back!'
        history.append({'isbotmessage': True, 'message': reply})
    else:
        history.append({'isbotmessage': False, 'message': message})
        idx = sum(item['isbotmessage'] for item in history) % len(replies)
        history.append({'isbotmessage': True, 'message': replies[idx]})

    session['history'] = history

    return history[-1]
