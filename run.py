from flask import Flask, render_template, request, redirect, url_for, flash
from pymongo import MongoClient
from app import create_app
from flask_login import current_user

app = create_app()

if __name__ == "_main_":
    app.run()

client = MongoClient('localhost', 27017)
db = client['database']
users_collection = db['users']


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recommend')
def recommend():
    return render_template('recommend.html')

@app.route('/favorites')
def favorites():
    return render_template('favorites.html')

@app.route('/wishlist')
def wishlist():
    return render_template('wishlist.html')

@app.route('/profile')
def profile():
    if current_user.is_authenticated:
        return render_template('profile.html')
    return redirect(url_for("auth.login"))

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    return redirect(url_for("auth.logout"))

@app.route('/search_results')
def search_results():
    return redirect(url_for("main.search"))

@app.route('/book')
def book():
    return redirect(url_for("main.book"))