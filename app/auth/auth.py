from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from flask import jsonify
from app.database.users import find_user_by_username, check_password
from bson import ObjectId
from app.extensions import mongo, login_manager


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

class User(UserMixin):
    def __init__(self, user_id, username, email):
        self.id = user_id
        self.username = username
        self.email = email

@login_manager.user_loader
def load_user(user_id):
    from app import mongo
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(str(user_data['_id']), user_data['username'], user_data['email'])
    return None 

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        domain = email.split('@')
        #check if the email has at least 1 @, the part before the last @ is non-empty, domain contains at least one .
        dot = email.count('@')
        point = email.count('.')
        user_data = find_user_by_username(username)
        print("username after split: ", domain)
        print("dot count: ", dot)
        print("point count: ", point)
        print("local-part", domain[0])
        print("user data", user_data.get('email'))
        if dot != 0 and point != 0 and domain[1] != None:
            if user_data.get('email') == email:
                message = "Taki użytkownik już istnieje."
                return render_template('register.html', message = message)
            else:
                from app import mongo
                user_id = mongo.db.users.insert_one({'username':username, 'email':email, 'password':password})
                return redirect(url_for('auth.login'))
        else:
            message = "Podany email jest niepoprawny."
            return render_template('register.html', message = message)
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if check_password(username, password):
            user_data = find_user_by_username(username)
            #if user_data
                
            user = User(str(user_data['_id']), user_data['username'], user_data['email'])
            login_user(user)
            return redirect(url_for('index'))
    return render_template('login.html')

@auth_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return render_template('login.html')
