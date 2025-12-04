from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from bson import ObjectId
from werkzeug.security import generate_password_hash
from app.extensions import mongo, login_manager
from app.database.users import (
    find_user_by_username,
    find_user_by_email,
    check_password
)

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


# ---------------- USER CLASS ----------------

class User(UserMixin):
    def __init__(self, user_id, username, email, favorites, wishlist):
        self.id = user_id
        self.username = username
        self.email = email
        self.favorites = favorites
        self.wishlist = wishlist


@login_manager.user_loader
def load_user(user_id):
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    if user_data:
        return User(
            str(user_data['_id']),
            user_data['username'],
            user_data['email'],
            user_data.get('favorites', []),
            user_data.get('wishlist', [])
        )
    return None


# ---------------- REGISTER ----------------

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    repeat_password = data.get("repeat_password")

    if len(password) > 255:
        return jsonify({"error": "Podane hasło jest za długie."}), 400
    if len(password) < 8: 
        return jsonify({"error": "Podane hasło jest za krótkie."}), 400

    if password != repeat_password:
        return jsonify({"error": "Podane hasła nie są identyczne."}), 400

    if '@' not in email or '.' not in email.split('@')[1]:
        return jsonify({"error": "Podany email jest niepoprawny."}), 400

    if find_user_by_username(username):
        return jsonify({"error": "Taka nazwa użytkownika jest już zajęta."}), 400

    if find_user_by_email(email):
        return jsonify({"error": "Taki email jest już zajęty."}), 400

    mongo.db.users.insert_one({
        "username": username,
        "email": email,
        "password": generate_password_hash(password),
        "favorites": [],
        "wishlist": []
    })

    return jsonify({"message": "Zarejestrowano pomyślnie."}), 201


# ---------------- LOGIN ----------------

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not check_password(username, password):
        return jsonify({"error": "Nieprawidłowa nazwa użytkownika lub hasło."}), 400

    user_data = find_user_by_username(username)

    user = User(
        str(user_data['_id']),
        user_data['username'],
        user_data['email'],
        user_data.get('favorites', []),
        user_data.get('wishlist', [])
    )
    login_user(user)

    return jsonify({"message": "Zalogowano pomyślnie.", "user": {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }}), 200


# ---------------- LOGOUT ----------------

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Wylogowano."}), 200

# ---------------- GET CURRENT USER ----------------

@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    if not current_user.is_authenticated:
        return jsonify({"user":None})
    return jsonify({
        "user": {
            "id": current_user.id,
            "username": current_user.username, 
            "email": current_user.email
        }
    })


# ---------------- GET PROFILE ----------------

@auth_bp.route("/profile", methods=['GET'])
@login_required
def get_profile():
    user = mongo.db.users.find_one({"_id": ObjectId(current_user.id)})
    user["_id"] = str(user["_id"])
    return jsonify(user), 200

# ---------------- CHANGE PROFILE ----------------

@auth_bp.route("/profile", methods=['PUT'])
@login_required
def update_profile():
    data = request.json
    mongo.db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": {
            "username": data.get("username"),
            "email": data.get("email")
        }}
    )
    return jsonify({"message": "Zaktualizowano."}), 200

# ---------------- CHANGE PASSWORD ----------------

@auth_bp.route("/change_password", methods=['POST'])
@login_required
def change_password():
    data = request.json()
    old_pswd = data.get("oldPassword")
    new_pswd = data.get("newPassword")

    if not current_user.check_password(old_pswd):
        return jsonify({"error": "Wrong password"}), 400
    
    current_user.set_password(new_pswd)
    mongo.db.users.update_one(
        {"_id": current_user.id},
        {"$set": {"password": current_user.password}}
    )
    return jsonify({"message": "Password changed"}), 200


# ---------------- GET FAVORITES ----------------

@auth_bp.route('/favorites', methods=['GET'])
@login_required
def get_favorites():
    user_id = current_user.id
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    favorite_books = []
    for book_id in user_data.get("favorites", []):
        book = mongo.db.books.find_one({'_id': ObjectId(book_id)})
        if book:
            book["_id"] = str(book["_id"])
            favorite_books.append(book)
    return jsonify({"favorites": favorite_books}), 200


# ---------------- ADD FAVORITE ----------------

@auth_bp.route('/add_favorite', methods=['POST'])
@login_required
def add_favorite():
    data = request.json
    book_id = data.get("book_id")

    if not book_id:
        return jsonify({"error": "Brak ID książki."}), 400
    
    user = mongo.db.users.find_one(
        {'_id': ObjectId(current_user.id)}
    )
    print(book_id)
    print(user.get('favorites', []))

    if book_id in user.get('favorites', []): 
        return jsonify({"message": "Książka jest już w ulubionych."}), 200

    mongo.db.users.update_one(
        {'_id': ObjectId(current_user.id)},
        {'$addToSet': {'favorites': book_id}}
    )

    return jsonify({"message": "Dodano książkę do ulubionych."}), 200

# ---------------- DELETE FAVORITE ----------------

@auth_bp.route('/remove_favorite/<book_id>', methods=['DELETE'])
@login_required
def remove_favorite(book_id):
    user_id = current_user.id
    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"favorites":book_id}}
    )

    return jsonify({"message": "Usunięto."}), 200

# ---------------- GET WISHLIST ----------------

@auth_bp.route('/wishlist', methods=['GET'])
@login_required
def get_wishlist():
    user_id = current_user.id
    user_data = mongo.db.users.find_one({'_id': ObjectId(user_id)})
    wishlist_books = []
    for book_id in user_data.get("wishlist", []):
        book = mongo.db.books.find_one({'_id': ObjectId(book_id)})
        if book:
            book["_id"] = str(book["_id"])
            wishlist_books.append(book)
    return jsonify({"wishlist": wishlist_books}), 200


# ---------------- ADD WISHLIST ----------------

@auth_bp.route('/add_wishlist', methods=['POST'])
@login_required
def add_wishlist():
    data = request.json
    book_id = data.get("book_id")

    if not book_id:
        return jsonify({"error": "Brak ID książki."}), 400
    
    user = mongo.db.users.find_one(
        {'_id': ObjectId(current_user.id)}
    )
    print(book_id)
    print(user.get('wishlist', []))

    if book_id in user.get('wishlist', []): 
        return jsonify({"message": "Książka jest już na liście życzeń."}), 200

    mongo.db.users.update_one(
        {'_id': ObjectId(current_user.id)},
        {'$addToSet': {'wishlist': book_id}}
    )

    return jsonify({"message": "Dodano książkę do listy życzeń."}), 200

# ---------------- DELETE WISHLIST ----------------

@auth_bp.route('/remove_wishlist/<book_id>', methods=['DELETE'])
@login_required
def remove_wishlist(book_id):
    user_id = current_user.id
    mongo.db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"wishlist":book_id}}
    )

    return jsonify({"message": "Usunięto."}), 200
