from flask import Flask
from flask_pymongo import PyMongo
from app.auth.auth import auth_bp

mongo = PyMongo()

def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config["MONGO_URI"] = "mongodb://localhost:27017/database"
    mongo.init_app(app)

    app.register_blueprint(auth_bp)
    return app
