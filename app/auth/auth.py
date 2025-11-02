from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from flask import jsonify
from ..database.users import create_user, find_user_by_username, check_password
from bson import ObjectId
from bcrypt import login_manager, mongo

auth_bp = Blueprint('auth', __name__)

class User:
    def __init__(self, user_id, username, email):
        self.id = user_id
        self.username = username
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(str(user_data['_id']), user_data['username'], user_data['email'])
    return None

# @auth_bp.route('/register', methods=['GET', 'POST'])
# def register():
#     if request.method == 'POST':
#         username = request.form.get['username']
#         email = request.form.get['email']
#         password = request.form.get['password']
#     existing_user = find_user_by_username(username)
#     if existing_user:
#         return None
#     user_id = create_user(username, email, password)
#     # return User(user_id, username, email)
#     return render_template('register.html')

# @auth_bp.route('/login', methods=['GET', 'POST'])
# def login(username, password):
#     if check_password(username, password):
#         user_data = find_user_by_username(username)
#         user = User(str(user_data['_id']), user_data['username'], user_data['email'])
#         login_user(user)
#         return render_template('index.html')
#     # return None
#     return render_template('login.html')

# @auth_bp.route('/logout', methods=['GET', 'POST'])
# @login_required
# def logout():
#     logout_user()
#     # return redirect(url_for('main.index'))
#     return render_template('login.html')
