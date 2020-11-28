
import json
import datetime
import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit

PROD = False
# check if in production and change static location
if PROD:
	static_folder = '/var/www/teaganlamp.com/html'
else:
	static_folder = '/home/tylerbenson/teaganLamp/static'
app = Flask(__name__, static_url_path='', static_folder=static_folder) 
CORS(app)
app.config['SECRET_KEY'] = 'secret!!'
socketio = SocketIO(app, cors_allowed_origins='*')

totalClicks = 0
isLampOn = False

@app.route('/')
def root():
	return app.send_static_file('index.html')


@app.route('/getLamp')
def getLamp():
    global isLampOn

    return {'isLampOn': isLampOn}

@app.route('/changeLamp')
def changeLamp():
    global isLampOn
    # do something that changes lamp... idk how
    isLampOn = not isLampOn
    socketio.emit('lamp changed', isLampOn)
    return {'success': 200}

if __name__ == "__main__":
    socketio.run(app)