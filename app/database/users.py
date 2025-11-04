from flask import app

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