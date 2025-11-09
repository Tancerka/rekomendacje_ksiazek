from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from flask import jsonify
from app.database.users import update_user_username, update_user_email, update_user_password
from bson import ObjectId
from app.extensions import mongo, login_manager

main_bp = Blueprint('main', __name__, url_prefix='/main')

@main_bp.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json()
    new_username = request.form.get('username')
    new_email = request.form.get('email')

   # new_password = request.form.get('password')
    
    print("Updating profile with:", data, request, new_username, new_email);

    user_id = current_user.id

    if new_username:
        update_user_username(user_id, new_username)
    if new_email:
        update_user_email(user_id, new_email)
    #if new_password:
     #   update_user_password(user_id, new_password)
    return redirect(url_for('profile'))

@main_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    results = []
    if query:
        title_results = list(mongo.db.books.find({'Title': {'$regex': query, '$options': 'i'}}, {"Title":1, "Author":1, "Category":1, "Score":1}))
        author_results = list(mongo.db.books.find({'Author': {'$regex': query, '$options': 'i'}}, {"Title":1, "Author":1, "Category":1, "Score":1}))
        category_results = list(mongo.db.books.find({'Category': {'$regex': query, '$options': 'i'}}, {"Title":1, "Author":1, "Category":1, "Score":1}))
        results = title_results + author_results + category_results
    return render_template('search_results.html', query=query, results=results)

@main_bp.route('/book', methods=['GET'])
def book():
    book_id = request.args.get('id', '')
    print(book_id)
    book = None
    if book_id:
        book = mongo.db.books.find_one({'_id': ObjectId(book_id)})
    return render_template('book.html', book=book)