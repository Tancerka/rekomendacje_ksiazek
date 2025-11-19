from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from bson import ObjectId
from app.extensions import mongo
from app.database.users import (
    update_user_username,
    update_user_email,
    update_user_password
)

main_bp = Blueprint('main', __name__, url_prefix='/main')

# ---------------- UPDATE PROFILE ----------------

@main_bp.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.json

    new_username = data.get("username")
    new_email = data.get("email")
    new_password = data.get("password")

    user_id = current_user.id

    if new_username:
        update_user_username(user_id, new_username)

    if new_email:
        update_user_email(user_id, new_email)

    if new_password:
        update_user_password(user_id, new_password)

    return jsonify({"message": "Profil zaktualizowany"}), 200



# ---------------- SEARCH ----------------

@main_bp.route('/search', methods=['GET'])
def search():
    print(f"query")
    query = request.args.get("q", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    skip = (page-1)*limit
    filter_option = request.args.get("filter", "all")
    sort_option = request.args.get("sort", "asc")

    if not query:
        return jsonify({"query": "", "results": []}), 200

    if filter_option == "books":
        filters = {"Title": {"$regex": query, "$options": "i"}}

    elif filter_option == "authors":
        filters = {"authors": {"$regex": query, "$options": "i"}}

    elif filter_option == "categories":
        filters = {"categories": {"$regex": query, "$options": "i"}}

    else: 
        filters = {
            "$or": [
                {"Title": {"$regex": query, "$options": "i"}},
                {"authors": {"$regex": query, "$options": "i"}},
                {"categories": {"$regex": query, "$options": "i"}},
            ]
        }

    sort_field = "Title"
    sort_direction = 1

    if sort_option == "desc":
        sort_direction = -1

    results = mongo.db.books.find(
            filters,
            {"Title": 1, "authors": 1, "categories": 1, "image":1}
        ).sort(sort_field, sort_direction)

    books = list(results.skip(skip).limit(limit))
    total_count = mongo.db.books.count_documents(filters)

    for book in books:
        book["_id"] = str(book["_id"])

    return jsonify({
        "query": query,
        "results": books,
        "page":page, 
        "limit":limit,
        "total_count": total_count
    }), 200



# ---------------- GET BOOK BY ID ----------------

@main_bp.route('/book', methods=['GET'])
def book():
    book_id = request.args.get("id")
    if not book_id:
        return jsonify({"error": "Brak ID książki"}), 400

    book = mongo.db.books.find_one({"_id": ObjectId(book_id)})
    if not book:
        return jsonify({"error": "Nie znaleziono książki"}), 404

    book["_id"] = str(book["_id"])

    return jsonify(book), 200
