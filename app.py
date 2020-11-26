
import json
import datetime
import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# check if in production and change static location
dir_path = os.path.dirname(os.path.realpath(__file__))
static_folder = '/var/www/static' if (dir_path == '/srv/teagalamp') else 'static'

app = Flask(__name__, static_url_path='', static_folder=static_folder) 
CORS(app)
app.config['SECRET_KEY'] = 'secret!!'


isLampOn = False


@app.route('/getLamp')
def getLamp():
    global isLampOn

    return {'isLampOn': isLampOn}

@app.route('/changeLamp')
def changeLamp():
    global isLampOn

    # do something that changes lamp... idk how
    isLampOn = not isLampOn

    return {'success': 200}
