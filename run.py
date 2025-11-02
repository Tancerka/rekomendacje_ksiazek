from flask import Flask, render_template

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb://localhost:27017/database"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recommend')
def recommend():
    return render_template('recommend.html')

@app.route('/wishlist')
def wishlist():
    return render_template('wishlist.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

# @app.route('/initialize_db')
# def init():
#     return render_template('login.html')