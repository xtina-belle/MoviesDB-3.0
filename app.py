from flask import Flask
from flask import render_template

app = Flask(__name__)


def get_users():
    users = []
    return users


@app.route('/')
def home():
    return render_template("home.html")


@app.route('/users')
def list_users():
    """This route will present a list of all users registered in our MovieWeb App."""
    return render_template("users.html")


@app.route("/users/login")
def login_page():
    """This route will exhibit a specific user’s list of favorite movies.
    We will use the <user_name> in the route to fetch the appropriate user’s movies."""
    return render_template("login.html")


@app.route("/users/del")
def del_page():
    """This route will exhibit a specific user’s list of favorite movies.
    We will use the <user_name> in the route to fetch the appropriate user’s movies."""
    return render_template("delete_user.html")


@app.route("/users/<user_name>")
def user_page(user_name):
    """ """
    return render_template("user_account.html", user=user_name)


if __name__ == '__main__':
    app.run(port=5007, debug=True)
