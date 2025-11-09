from flask import app
from bson import ObjectId

def find_user_by_username(username):
    from app import mongo 
    user = mongo.db.users.find_one({'username': username})
    if user:
        user['_id'] = str(user['_id'])
    return user

def find_user_by_email(email):
    from app import mongo 
    user = mongo.db.users.find_one({'email': email})
    if user:
        user['_id'] = str(user['_id'])
    return user

def check_password(username, password):
    from app import mongo 
    user = mongo.db.users.find_one({'username': username})
    if user and (user['password'] == password):
        return True
    
def update_user_username(user_id, new_username):
    from app import mongo 
    mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'username': new_username}})
    
def update_user_email(user_id, new_email):
    from app import mongo 
    mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'email': new_email}})

def update_user_password(user_id, new_password):
    from app import mongo 
    mongo.db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'password': new_password}})