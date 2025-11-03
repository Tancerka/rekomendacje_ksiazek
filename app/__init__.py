from flask import Flask
from app.auth.auth import auth_bp
from app.extensions import mongo, login_manager

def create_app():
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config["MONGO_URI"] = "mongodb://localhost:27017/database"
    app.config['SECRET_KEY'] = 'secret_key'
    mongo.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    app.register_blueprint(auth_bp)
    return app
