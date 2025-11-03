from flask import app

# @app.route("/initialize_db", methods=['GET', 'POST'])
#def create_user(username, email, password):
#    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
#    user_id = mongo.db.users.insert_one({
#        'username': username,
#        'email': email,
#        'password': hashed_password
#    }).inserted_id
#    return str(user_id)

def find_user_by_username(username):
    from app import mongo 
    user = mongo.db.users.find_one({'username': username})
    if user:
        user['_id'] = str(user['_id'])
    return user

def check_password(username, password):
    from app import mongo 
    user = mongo.db.users.find_one({'username': username})
    if user and (user['password'] == password):
        return True