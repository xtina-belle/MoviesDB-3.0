import logging
import os

import flask
from flask import request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from db import users_manager
from db.movie_storage_csv import MovieDBCsv
from db.movie_storage_json import MovieDBJson
from movie_app_client import MovieAppClient


app_api = flask.Flask(__name__)
CORS(app_api)  # This will enable CORS for all routes
limiter = Limiter(get_remote_address, app=app_api)
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s %(levelname)s: %(message)s", datefmt="%Y-%m-%d %H:%M:%S")

USERS = users_manager.Users("db/users/users.json")
USERS.setup()


def get_account(user_name):
    for account in os.listdir("db/accounts"):
        if user_name in account:
            return account


def get_db(account):
    account_path = f"db/accounts/{account}"
    db = MovieDBCsv(account_path) if ".csv" in account_path else MovieDBJson(account_path)
    client = MovieAppClient(db)
    if not get_account(account):
        client.run_new_account()
        print(f'running new account :{get_account(account_path)}')
    client.setup()
    return client


@app_api.route("/api/users")
@limiter.limit("20/minute")
def users():
    USERS.setup()
    return flask.jsonify(USERS.get_users())


@app_api.route("/api/users/del", methods=["DELETE"])
@limiter.limit("5/minute")
def delete_user():
    user_info = request.get_json()
    username = user_info['username']
    app_api.logger.info(f"Delete request received for /api/users/del")
    account = get_account(username)
    account_path = f"db/accounts/{account}"
    try:
        if USERS.delete_user(username, user_info['password']):
            os.remove(account_path)
            return flask.jsonify({"success": True}), 200
    except ValueError as e:
        app_api.logger.info(e)
        return flask.jsonify({"error": "Invalid password"}), 200


@app_api.route("/api/users/login", methods=["POST"])
@limiter.limit("20/minute")
def login_page():
    log_info = request.get_json()
    username = log_info['username']
    app_api.logger.info(f"Try to log {username}")
    try:
        if USERS.check_user(username, log_info['password']):
            app_api.logger.info(f"User logged successfully for /api/users/{username}")
            return flask.jsonify({"success": True}), 200
    except ValueError as e:
        app_api.logger.info(e)
        return flask.jsonify({"error": "Invalid password"}), 200


@app_api.route("/api/users/newlogin", methods=["POST"])
@limiter.limit("5/minute")
def newlogin_page():
    log_info = request.get_json()
    username = log_info['username']
    app_api.logger.info(f"Try to log {username}")
    try:
        if USERS.add_user(username, log_info['password']):
            app_api.logger.info(f"User created successfully for /api/users/{username}")
            account = username + '.json'
            get_db(account)
            return flask.jsonify({"success": True}), 200
    except ValueError as e:
        app_api.logger.info(e)
        return flask.jsonify({"error": f"{e}"}), 200


@app_api.route("/api/users/<user_name>")
@limiter.limit("20/minute")
def user_page(user_name):
    account = get_account(user_name)
    movies_client = get_db(account)
    movies = []
    for movie in movies_client.get_all_movies().values():
        movies.append(movie)
    return flask.jsonify(movies)


@app_api.route("/api/users/<user_name>/add_movie", methods=["POST"])
@limiter.limit("12/minute")
def add_movie(user_name):
    """This route will display a form to add a new movie to a user’s list of favorite movies."""
    account = get_account(user_name)
    movies_client = get_db(account)
    name = request.get_json()
    if movies_client.add_movie(name):
        app_api.logger.info(f"Movie {name} successfully added")
        return flask.jsonify({"success": True}), 200
    app_api.logger.info(f"Movie {name} not found")
    return flask.jsonify({"success": False}), 200


@app_api.route("/api/users/<user_name>/delete_movie", methods=["DELETE"])
@limiter.limit("60/minute")
def delete_movie(user_name):
    account = get_account(user_name)
    movies_client = get_db(account)
    name = request.get_json()
    movies_client.delete_movie(name)
    app_api.logger.info(f"Movie {name} successfully deleted")
    return flask.jsonify({"success": True}), 200


@app_api.route("/api/users/<user_name>/update_movie", methods=["POST"])
@limiter.limit("10/minute")
def update_movie(user_name):
    account = get_account(user_name)
    movies_client = get_db(account)
    movie_data = request.get_json()
    movies_client.update_movie(movie_data["name"], movie_data["text"])
    app_api.logger.info(f"Movie {movie_data['name']} successfully updated")
    return flask.jsonify({"success": True}), 200


if __name__ == "__main__":
    app_api.run(host="0.0.0.0", port=5008, debug=True)
