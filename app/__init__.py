from flask import Flask
from flask_cors import CORS
from app.auth.auth import auth_bp
from app.main.routes import main_bp
from app.admin.admin import admin_bp
from app.extensions import mongo, login_manager

def create_app():
    app = Flask(__name__)
    app.config["MONGO_URI"] = "mongodb://localhost:27017/database"
    app.config['SECRET_KEY'] = 'secret_key'
    mongo.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    return app
