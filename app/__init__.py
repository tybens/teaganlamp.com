
import json
import datetime
import os
import redis

from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
from flask_socketio import SocketIO, send, emit
from flask_pymongo import PyMongo

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

player_redis = redis.Redis(decode_responses=True, db=0)
player_redis.hset('leaderboard', {'teagan_poopoo':0})


if player_redis.exists('totalClicks'):
    totalClicks = player_redis.get('totalClicks')
else:
    player_redis.set('totalClicks', 0)
    totalClicks = 0


isLampOn = False

@app.route('/')
def root():
	return app.send_static_file('index.html')


@app.route('/getLampAndClicks')
def getLampAndClicks():
    global isLampOn
    global totalClicks
    return {'isLampOn': isLampOn,
    		'totalClicks': totalClicks}

@app.route('/changeLamp')
def changeLamp():
    global isLampOn
    global totalClicks

    totalClicks += 1
    isLampOn = not isLampOn

    username = request.get_json().username
    newClicks = player_redis.get(username)+1
    player_redis.set(newClicks)
    player_redis.hset(player_redis.hgetall('leaderboard').update({username: newClicks}))

    socketio.emit('lamp changed', {'isLampOn':isLampOn, 'totalClicks':totalClicks})
    # do something that changes PHYSICAL lamp... idk how
    return make_response({'userClicks': newClicks}, 200)

@app.route('/createUser')
def createUser():

    username = request.get_json().username  

    alreadyExists = player_redis.exists(username)

    if alreadyExists:
        return make_response({'Error': 'Username already exists!!'}, 400)
    
    players_redis.set(username, 0)
    players_redis.hset(players_redis.hgetall('leaderboard').update({username: 0}))

    # maybe emit PLAYER CREATED (to call leaderboard)
    return make_response({'success': 'player created'}, 200)

@app.route('/leaderboard')
def leaderboard():
    leaderboard = player_redis.hgetall('leaderboard')

    return make_response(jsonify(leaderboard), 200)


if __name__ == "__main__":
    socketio.run(app)