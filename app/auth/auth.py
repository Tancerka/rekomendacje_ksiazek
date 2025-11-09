from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from flask import jsonify
from app.database.users import find_user_by_username, find_user_by_email,  check_password
from bson import ObjectId
from app.extensions import mongo, login_manager


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

class User(UserMixin):
    def __init__(self, user_id, username, email, favorites):
        self.id = user_id
        self.username = username
        self.email = email
        self.favorites = favorites

@login_manager.user_loader
def load_user(user_id):
    from app import mongo
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(str(user_data['_id']), user_data['username'], user_data['email'], user_data['favorites'])
    return None 

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        repeat_password = request.form.get('repeat-password')
        domain = email.split('@')
        #check if the email has at least 1 @, the part before the last @ is non-empty, domain contains at least one .
        dot = email.count('@')
        point = email.count('.')
        username_data = find_user_by_username(username)
        email_data = find_user_by_email(email)
        print(username_data)
        print(email_data)
        if password != repeat_password:
                    message = "Podane hasła nie są identyczne."
                    return render_template('register.html', message = message)
        if dot != 0 and point != 0 and domain[1] != None:
            if username_data != None or email_data != None:
                if username_data != None:
                    if username_data.get('email') == email:
                        message = "Taki użytkownik już istnieje."
                        return render_template('register.html', message = message)
                    if username == username_data.get('username'):
                        message = "Taka nazwa użytkownika jest już zajęta."
                        return render_template('register.html', message = message)
                if email_data != None:
                    if email_data.get('username') == username:
                        message = "Taki użytkownik już istnieje."
                        return render_template('register.html', message = message)
                    if email == email_data.get('email'):
                        message = "Taki email jest już zajęty."
                        return render_template('register.html', message = message)
            else:
                from app import mongo
                user_id = mongo.db.users.insert_one({'username':username, 'email':email, 'password':password, 'favorites': []})
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
                
            user = User(str(user_data['_id']), user_data['username'], user_data['email'], user_data['favorites'])
            login_user(user)
            return redirect(url_for('index'))
        else:
            message = "Nieprawidłowa nazwa użytkownika lub hasło."
            return render_template('login.html', message=message)
    return render_template('login.html')

@auth_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return render_template('login.html')

@auth_bp.route('/favorites', methods=['GET'])
@login_required
def get_favorites():
    user_id = current_user.id
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    favorite_books = []
    if 'favorites' in user_data:
        favorite_ids = user_data['favorites']
        for book_id in favorite_ids:
            book = mongo.db.books.find_one({'_id': ObjectId(book_id)})
            print(book)
            if book:
                favorite_books.append(book)
    print(favorite_books)
    return render_template('favorites.html', favorites=favorite_books)

@auth_bp.route('/add_favorite', methods=['POST'])
@login_required
def add_favorite():
    user_id = current_user.id
    book_id = request.get_json().get('book_id')
    print(book_id)
    print("Adding book to favorites:", book_id)
    mongo.db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$addToSet': {'favorites': book_id}}
    )
    return jsonify({"message: Book added to favorites"})