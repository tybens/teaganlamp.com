
import json
import datetime
import os
import redis

from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit

# static file directory
dir_path = os.path.dirname(os.path.realpath(__file__))
static_folder = '/var/www/teaganlamp.com/html' if (dir_path == '/srv/teaganlamp.com/app') else 'static'

app = Flask(__name__, static_url_path='', static_folder=static_folder) 
CORS(app)
app.config['SECRET_KEY'] = 'secret!!'
socketio = SocketIO(app, cors_allowed_origins='*')

player_redis = redis.Redis(decode_responses=True, db=0)


# initialize player_redis
if player_redis.exists('totalClicks'):
    totalClicks = player_redis.get('totalClicks')
else:
    player_redis.set('totalClicks', str(0))
    totalClicks = str(0)

if not player_redis.exists('leaderboard'):
    player_redis.hmset('leaderboard', {'teagan_poopoo': 69})

if not player_redis.exists('isLampOn'):
    player_redis.set('isLampOn', 1) 
    isLampOn = 1
else:
    isLampOn = player_redis.get('isLampOn')



@app.route('/')
def root():
	return app.send_static_file('index.html')


# returns current state of Teagan Lamp as well as total click count
@app.route('/getLampAndClicksAndUserClicks', methods=["POST"])
def getLampAndClicks():
    global isLampOn
    global totalClicks
    username = request.get_json()['username']
    userClicks = player_redis.get(username)
    return {'isLampOn': isLampOn,
    		'totalClicks': totalClicks,
            'userClicks': userClicks}

@app.route('/changeLamp', methods=["POST"])
def changeLamp():
    global isLampOn
    global totalClicks

    # update total clcks and current lamp state
    totalClicks = str(int(totalClicks)+1)
    player_redis.set('totalClicks', totalClicks)
    isLampOn = int(not isLampOn)
    player_redis.set('isLampOn', isLampOn)

    # update user clicks in database
    username = request.get_json()['username']
    newClicks = str(int(player_redis.get(username))+1)
    player_redis.set(username, newClicks)

    # update leaderboard 
    leaderboard = player_redis.hgetall('leaderboard')
    leaderboard.update({username: newClicks})
    player_redis.hmset('leaderboard', leaderboard)

    socketio.emit('lamp changed', {'isLampOn':isLampOn, 'totalClicks':totalClicks, 'userClicked':username})
    # do something that changes PHYSICAL lamp... idk how
    return make_response({'userClicks': newClicks}, 200)

@app.route('/createUser', methods=["POST"])
def createUser():

    username = request.get_json()['username']

    alreadyExists = player_redis.exists(username)

    if alreadyExists:
        return make_response({'loggedIn': 'Logged in to ' + str(username)}, 200)
    
    player_redis.set(username, 0)
    leaderboard = player_redis.hgetall('leaderboard')
    leaderboard.update({username: 0})
    player_redis.hmset('leaderboard', leaderboard)

    # maybe emit PLAYER CREATED (to call leaderboard)
    return make_response({'success': 'player created'}, 200)

@app.route('/leaderboard')
def leaderboard():
    leaderboard = player_redis.hgetall('leaderboard')

    return make_response(jsonify(leaderboard), 200)


if __name__ == "__main__":
    socketio.run(app)