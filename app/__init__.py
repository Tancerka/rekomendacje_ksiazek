from flask import Flask
from flask_pymongo import PyMongo

mongo = PyMongo

def create_app():
    app = Flask(__name__)
    app.config["MONGO_URI"] = "mongodb://localhost:27017/database"
    mongo.init_app(app)

    from app.auth.auth import auth_bp
    app.register_blueprint(auth_bp)
    return app
