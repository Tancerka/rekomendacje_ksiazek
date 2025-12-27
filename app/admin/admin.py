from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from bson import ObjectId
from app.extensions import mongo
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Nie jesteś zalogowany"}), 401
        user_id = current_user.id
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if not user or user.get('role') != "admin":
            return jsonify({"error": "Brak uprawnień administratora."}), 403
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/books', methods=['GET'])
@admin_required
def get_all_books():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '').strip()

        skip = (page - 1)*per_page

        query = {}
        if search:
            query = {
                '$or': [
                    {'title', {'$regex': search, '$options': "i"}},
                    {'authors.name', {'$regex': search, '$options': "i"}}
                ]
            }
        books = list(mongo.db.books.find(query))

        total = mongo.db.books.count_documents(query)

        for book in books: 
            book['_book'] = str(book['_id'])

        return jsonify({
            'books': books,
            'total': total,
            'page': page,
            'per_page':per_page,
            'pages': (total+per_page-1) // per_page
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
