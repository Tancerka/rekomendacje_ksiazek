from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user, UserMixin
from bson import ObjectId
from app.extensions import mongo
from functools import wraps
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from app.model.emotion_analyzer import analyze_reviews
import re
from collections import Counter

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
                    {'title': {'$regex': search, '$options': "i"}},
                    {'authors.name': {'$regex': search, '$options': "i"}}
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
    
@admin_bp.route('/books/<book_id>', methods=['DELETE'])
@admin_required
def delete_book(book_id):
    try:
        result = mongo.db.books.delete_one({"_id": ObjectId(book_id)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    if result.deleted_count == 0:
        return jsonify({"error": "Nie znaleziono książki"}), 404
    return jsonify({"success": True})
    


def normalize(text):
    return text.lower().replace(",", "").strip()

def search_book_on_lc(title, author_query):
    search_url = f"https://lubimyczytac.pl/szukaj/ksiazki?phrase={quote(title)}"
    r = requests.get(search_url, headers= {"User-Agent": "Mozilla/5.0"}, timeout=10)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")
    results = []

    for a in soup.select('.authorAllBooks__single'):
        title_elem = a.select_one("a.authorAllBooks__singleTextTitle")
        authors_elem = a.select_one(".authorAllBooks__singleTextAuthor a")

        if not title_elem:
            continue
        book_title=title_elem.text.strip()
        book_url = "https://lubimyczytac.pl"+title_elem["href"]
        authors = [a.text.strip() for a in authors_elem]

        norm_authors = [normalize(a) for a in authors]
        norm_query = normalize(author_query)

        author_match = any(
            norm_query in author
            for author in norm_authors
        )

        title_match = normalize(title) in normalize(book_title)

        if title_match and author_match:
            results.append({
                "title":book_title,
                "authors": authors,
                "url": book_url
            })
    return results

@admin_bp.route('/scrape_book', methods=['POST'])
@admin_required
def scrape_book():
    data = request.get_json()
    title = data.get("title", "").strip()
    authors = data.get("authors", "").strip()

    if not title or not authors:
        return jsonify({"error": "Podaj tytuł i autora"}), 400
    
    matches = search_book_on_lc(title, authors)

    if not matches: 
        return jsonify({"error": "Nie znaleziono książki"}), 404
    
    if len(matches) > 1:
        return jsonify({
            "multiple": True,
            "results": matches
        })
    
    book_data = scrape_book_page(matches[0]["url"])
    return jsonify({
        "multiple": True,
        "book": book_data
    })

def scrape_book_page(book_url, max_reviews: int = 10):
    r = requests.get(book_url, headers={"User-Agent": "Mozilla/5/0"}, timeout=10)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    book_id_match = re.search(r'/ksiazka/(\d+)', book_url)
    book_id = book_id_match.group(1) if book_id_match else None

    title = soup.select_one('meta[property="og:title"]')
    title = title["content"].split("|")[0].strip() if title else None

    short_description = soup.select_one('meta[name="description"]')
    short_description = short_description["content"] if short_description else None

    long_desc_elem = soup.select_one('#book-description .collapse-content p')
    long_description = long_desc_elem.get_text(strip=True) if long_desc_elem else short_description

    isbn_elem = soup.select_one('meta[property="books:isbn"]')
    isbn = isbn_elem["content"] if isbn_elem else None

    publisher_elem = soup.select_one('a[href*="/wydawnictwo/"]')
    publisher = publisher_elem.get_text(strip=True) if publisher_elem else None

    authors = []
    for a in soup.select('.book__author a[href*="/autor/"]'):
        name = a.get_text(strip=True)
        href=a.get("href")
        author_id_match = re.search(r'/autor/(\d+)', href)
        if not author_id_match:
            continue 

        authors.append({
            "id": author_id_match.group(1),
            "name": name,
            "url": f"https://lubimyczytac.pl{href}" if href.startswith('/') else href
        })

    category = None
    publisher = None
    release_date = None
    pages = None

    for dt, dd in zip(soup.select("dt"), soup.select("dd")):
        label = dt.get_text(strip=True)
        value=dd.get_text(strip=True)

        if "Gatunek" in label or "Kategoria" in label:
            category = value

        if "Wydawnictwo" in label:
            publisher = value

        if "Data wydania" in label:
            release_date = value

        elif "Stron" in label: 
            pages = int(re.search(r'\d+', value).group())

    rating_elem = soup.select_one('meta[property="books:rating:value"]')
    rating = float(rating_elem["content"]) if rating_elem else None

    ratings_count_meta = soup.select_one('meta[property="books:rating:count"]')
    ratings_count = int(ratings_count_meta["content"]) if ratings_count_meta else None

    cover = soup.select_one('meta[property="og:image"]')
    cover_image = cover["content"] if cover else None

    canonical = soup.select_one('link[rel="canonical"]')
    url = canonical["href"] if canonical else book_url

    reviews = []
    reviews_url = f"htpps://lubimyczytac.pl/ksiazka/{book_id}/recenzje"
    try:
        rr = requests.get(reviews_url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        rr.raise_for_status()
        soup_r = BeautifulSoup(rr.text, "html.parser")
        reviews_elements = soup_r.select('.comment-cloud')[:max_reviews]

        for r_elem in reviews_elements:
            author = r_elem.select_one('.reviewer-nick a') or r_elem.select_one('.reviewer-nick')
            author = author.get_text(strip=True) if author else "Anonim"

            rating_elem = r_elem.select_one('.big-number')
            rating_value = float(re.search(r'\d+[,.]?\d*', rating_elem.get_text()).group().replace(',', '.')) if rating_elem else None

            text_elem = r_elem.select_one('p.expandTextNoJS.p-expanded.js-expanded') or r_elem.select_one('p.expandTextNoJS')
            text = text_elem.get_text(strip=True) if text_elem else ""

            date_elem = r_elem.select_one('.mx-3.date.comment-cloud__date') or r_elem.select_one('.comment-date')
            date = date_elem.get_text(strip=True) if date_elem else "Brak daty"

            reviews.append({
                "author": author,
                "rating": rating_value,
                "text": text,
                "date": date
            })
    except Exception as e:
        print("Nie udało się pobrać recenzji {e}")

    if reviews:
        all_emotions = []
        for rev in reviews:
            emotions = analyze_reviews(rev["text"])
            rev["emotions"] = emotions
            all_emotions.extend(emotions)
        dominant_emotion = [
            e for e, _ in Counter(all_emotions).most_common(5)
        ] or ["neutralne"]
    else: 
        dominant_emotion = ["neutral"]


    return{
        "id": book_id,
        "title":title,
        "authors": authors,
        "shortDescription": short_description,
        "longDescription": long_description,
        "category": category,
        "publisher": publisher,
        "releaseDate": release_date,
        "pages": pages,
        "isbn": isbn,
        "rating": rating,
        "ratingsCount": ratings_count,
        "coverImage": cover_image,
        "url": book_url,
        "reviews": reviews,
        "dominant_emotion": dominant_emotion
    }



@admin_bp.route('/scrape_confirm', methods=['POST'])
@admin_required
def scrape_confirm():
    data = request.get_json()
    book = data.get("book")

    if not book:
        return jsonify({"error": "Brak danych książki."}), 400
    
    if mongo.db.books.find_one({"url": book["url"]}):
        return jsonify({"error": "Książka już istnieje."}), 400

    result = mongo.db.books.insert_one(book)
    book["_id"] = str(result.inserted_id)

    return jsonify({"success": True, "book": book})
