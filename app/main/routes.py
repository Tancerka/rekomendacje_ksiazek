from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from bson import ObjectId
from collections import Counter
import numpy as np
from app.extensions import mongo
from app.database.users import (
    update_user_username,
    update_user_email,
    update_user_password
)
from app.model.emotion_analyzer import analyze_query_phrase

main_bp = Blueprint('main', __name__, url_prefix='/main')

# ---------------- UPDATE PROFILE ----------------

@main_bp.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.json

    new_username = data.get("username")
    new_email = data.get("email")

    user_id = current_user.id

    if new_username:
        update_user_username(user_id, new_username)

    if new_email:
        update_user_email(user_id, new_email)

    return jsonify({"message": "Profil zaktualizowany"}), 200



# ---------------- UPDATE PASSWORD ----------------

@main_bp.route('/change_password', methods=['POST'])
@login_required
def change_password():
    data = request.json

    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Brak danych"}), 400
    
    if not current_user.check_password(old_password):
        return jsonify({"error": "Nieprawidłowe stare hasło"}), 403
    
    update_user_password(current_user.id, new_password)

    return jsonify({"message": "Hasło zmienione"}), 200



# ---------------- SEARCH ----------------


@main_bp.route('/search', methods=['GET'])
def search():
    query = request.args.get("q", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    skip = (page-1)*limit
    filter_option = request.args.get("filter", "all")
    sort_option = request.args.get("sort", "asc")
    emotion = request.args.get("emotion", None)
    
    detected_emotions = []
    should_analyze_emotions = False
    filters = {}
    text_filters = {}
    combined_results = False

    sort_field = "title"
    sort_direction = 1

    if sort_option == "desc":
        sort_direction = -1
    elif sort_option == 'score_desc':
        sort_field = 'rating'
        sort_direction = -1
    elif sort_option == 'score_asc':
        sort_field = 'rating'
        sort_direction = 1

    if emotion and not query:
        emotion = emotion.lower().strip()
        detected_emotions = [emotion]
        filters = {"dominant_emotion": {"$in": [emotion]}}

        filters = {"dominant_emotion": {"$in": [emotion]}}

        results = list(mongo.db.books.find(
            filters,
            {"title": 1, "authors.name": 1, "category": 1, "coverImage":1, "rating":1, "shortDescription":1, "dominant_emotion":1}        
        ).sort(sort_field, sort_direction).skip(skip).limit(limit))

        total_count = mongo.db.books.count_documents(filters)

        for book in results:
            book["_id"] = str(book["_id"])
            book["result_type"] = "emotion_match"

        return jsonify({
            "query": query,
            "results": results,
            "page":page, 
            "limit":limit,
            "total_count": total_count,
            "detected_emotions": [emotion],
            "emotion_search": True,
            "combined_results": False
        }), 200
    
    elif query:
        if filter_option == "books":
            text_filters = {"title": {"$regex": query, "$options": "i"}}

        elif filter_option == "authors":
            text_filters = {"authors.name": {"$regex": query, "$options": "i"}}

        elif filter_option == "category":
            text_filters = {"category": {"$regex": query, "$options": "i"}}

        else: 
            text_filters = {
                "$or": [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"authors.name": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}},
                ]
            }

        if filter_option == "all":
            detected_emotions = analyze_query_phrase(query)
            should_analyze_emotions = True

        text_total = mongo.db.books.count_documents(text_filters)
        text_skip = min(skip, text_total)
        text_limit = max(0, limit)

        text_results = list(mongo.db.books.find(
            text_filters,
            {"title": 1, "authors.name": 1, "category": 1, "coverImage":1, "rating":1, "shortDescription":1, "dominant_emotion":1}        
        ).sort(sort_field, sort_direction).skip(text_skip).limit(text_limit))

        for book in text_results:
            book["_id"] = str(book["_id"])
            book["result_type"] = "text_match"
        
        remaining = limit - len(text_results)
        emotion_results = []

        if remaining > 0 and detected_emotions:
            emotion_skip = max(0, skip - text_total)

            emotion_query = {
                "dominant_emotion":{"$in": detected_emotions},
                "_id":{"$nin": [ObjectId(b["_id"]) for b in text_results]}
            }
            
            emotion_results = list(mongo.db.books.find(
            emotion_query,
                {"title": 1, "authors.name": 1, "category": 1, "coverImage":1, "rating":1, "shortDescription":1, "dominant_emotion":1}
            ).sort(sort_field, sort_direction).skip(emotion_skip).limit(remaining))

            for book in emotion_results:
                book["_id"] = str(book["_id"])
                book["result_type"] = "emotion_match"

            results = text_results + emotion_results
            combined_results = True

            text_total = mongo.db.books.count_documents(text_filters) if text_filters else 0
            emotions_total = mongo.db.books.count_documents({
                "dominant_emotion":{"$in": detected_emotions}
            }) if detected_emotions else 0

            total_count = text_total + emotions_total


        else:
            results = text_results
            total_count = mongo.db.books.count_documents(text_filters) if text_filters else 0

        return jsonify({
            "query": query,
            "results": results,
            "page":page, 
            "limit":limit,
            "total_count": total_count,
            "detected_emotions": detected_emotions if should_analyze_emotions else [],
            "emotion_search": bool(detected_emotions and combined_results),
            "combined_results": combined_results
        }), 200
    else:
        return jsonify({
            "query": query,
            "results": [],
            "page":page, 
            "limit":limit,
            "total_count": 0,
            "detected_emotions": [],
            "emotion_search": False
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

# ---------------- GET TOP RATED BOOKS ----------------

@main_bp.route("/books/top-rated", methods=['GET'])
def top_rated():
    books = list(
        mongo.db.books.find()
        .sort("rating", -1)
        .limit(20)
    )
    for b in books:
        b["_id"] = str(b["_id"])
    return jsonify(books)

# ---------------- GET BOOKS BY EMOTION ----------------

@main_bp.route("/books/by-emotion/<emotion>", methods=['GET'])
def by_emotion(emotion):
    books = list(
        mongo.db.books.find({"dominant_emotion": {"$regex": emotion, "$options": "i"}})
        .limit(20)
    )
    for b in books:
        b["_id"] = str(b["_id"])
    return jsonify(books)

# ---------------- GET ALL TOP RATED BOOKS BY EMOTION ----------------

@main_bp.route("/books/top-by-emotion")
def top_by_emotion():
    try: 
        emotions = mongo.db.books.distinct("dominant_emotion")
        result = []

        for emotion in emotions:  
            books = list(
                mongo.db.books.find(
                    {
                        "dominant_emotion": emotion,
                        "rating": {"$exists":True}
                    }
                )
            .sort("rating", -1)
            )
            for book in books:
                book["_id"] = str(book["_id"])

            if books:
                result.append({
                    "emotion": emotion,
                    "book": book    
                })
        return jsonify(result)
    except Exception as e:
        print("Błąd:", e)
        return jsonify({"error": "Nie udało się pobrać książek"}), 500

# ---------------- RECOMMENDATIONS ----------------

@main_bp.route('/recommendations', methods=['GET'])
def recommendations(): 

    # 1. Pobierz użytkownika
    # 2. Jeśli użytkownik nie ma ulubionych książek, to pokaż te najpopularniejsze
    # 3. Zbierz wszystkie ulubione książki
    # 4. Zbierz emocje, kategorie i ratingi
    # 5. Zbierz te emocje, które występują najczęściej w ulubionych książkach (top 3)
    # 6. Wyszukaj książki, które mają najwięcej pasujących emocji (wyklucz te, które już ma w ulubionych, weź te, które są mniej więcej w średniej ratingu)
    # 7. Wyszukaj książki, które pasują do emocji i ulubionych kategorii
    # 8. Zrób tablicę ocen -> dodaj punkty za dopasowanie (3 za emocje, 2 za kategorię, 0-1 za rating w zal. od bliskości)
    # 9. Dodaj score do wyników
    # 10. Posortuj i weź pierwsze 10 , ale coś jak 3 pozycje, które użytkownik ocenia, czy podoba mu się wynik; niekoniecznie 10 wyników od razu
    try:
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 15))
        user_id = current_user.id
        if not user_id:
            return jsonify({'error': 'Nie jesteś zalogowany'}), 401
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if not user or 'favorites' not in user or len(user['favorites']) == 0:
            #jeśli brak ulubionych książek, to zwraca te z największym ratingiem
            popular_books = list(mongo.db.books.find().sort('rating', -1).limit(10))
            for book in popular_books:
                book['_id'] = str(book['_id'])
            return jsonify({'recommendations': popular_books, 'basedOn': 'popular'})

        # pobierz ulubione książki
        favorite_ids = [ObjectId(fav_id) if isinstance(fav_id, str) else fav_id
                        for fav_id in user['favorites']]
        favorite_books = list(mongo.db.books.find({'_id': {'$in': favorite_ids}}))

        wishlist_ids = [ObjectId(wish_id) if isinstance(wish_id, str) else wish_id
                        for wish_id in user['wishlist']]
        
        excluded_ids = list(set(favorite_ids+wishlist_ids))

        # zbierz dane z książek
        emotion_counts = Counter()
        categories = set()
        ratings = []

        for book in favorite_books:
            # emocje
            if 'dominant_emotion' in book and book['dominant_emotion']:
                if isinstance(book['dominant_emotion'], list):
                    for emotion in book['dominant_emotion']:
                        emotion_counts[emotion.lower()] +=1
                else:
                    emotion_counts[book['dominant_emotion'].lower()] +=1
            # kategorie
            if 'category' in book and book['category']:
                cats = [c.strip() for c in book['category'].split(',')]
                categories.update(cats)
            # rating
            if 'rating' in book and book['rating']:
                ratings.append(float(book['rating']))
            
        # statystyki książek użytkownika

        avg_rating = sum(ratings)/len(ratings) if ratings else 6.0

        top_emotions = [emotion for emotion, count in emotion_counts.most_common(3)]

        # wyszukanie podobnych książek

        query = {
            '_id': {'$nin': excluded_ids},
            'rating': {'$gte': avg_rating -1.5}
        }

        if top_emotions or categories: 
            or_conditions = []
            if top_emotions:
                or_conditions.append({'dominant_emotion': {'$in': top_emotions}})
            if categories:
                for cat in categories:
                    or_conditions.append({'category': {'$regex': cat, '$options': 'i'}}) 
            query['$or'] = or_conditions

        candidate_books = list(mongo.db.books.find(query))
        scored_books = []

        for book in candidate_books:
            score = 0

            if 'dominant_emotion' in book and book['dominant_emotion']:
                book_emotions = book['dominant_emotion'] if isinstance (book['dominant_emotion'], list) else [book['dominant_emotion']]
                for emotion in book_emotions:
                    if emotion.lower() in top_emotions:
                        score +=3
            if 'category' in book and book['category']:
                book_cats = [c.strip().lower() for c in book['category'].split(',')]    
                for cat in book_cats:
                    if any(cat in fav_cat.lower() or fav_cat.lower() in cat 
                            for fav_cat in categories):
                        score += 2
            if 'rating' in book and book['rating']:
                rating_diff = abs(float(book['rating']) - avg_rating)
                score += max(0, 1 - rating_diff /5)
                
            book['score'] = score
            book['_id'] = str(book['_id'])
            scored_books.append(book)

        # sortowanie wyników po ratingu
        scored_books.sort(key=lambda x: x['score'], reverse=True)
        top_rec = scored_books[offset: offset+limit]

        return jsonify({
            'recommendations': top_rec,
            'basedOn': {
                'topEmotions': top_emotions,
                'categories': list(categories),
                'avgRating': round(avg_rating, 2),
                'totalFavorites': len(favorite_books)
            }
        })            
 
    except Exception as e:
        print(f"Błąd w rekomendacjach: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': "Błąd podczas generowania rekomendacji"}), 500
        