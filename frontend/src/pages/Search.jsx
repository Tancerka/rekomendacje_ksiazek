import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AnimatedList from "../components/AnimatedList";
import BookTile from "../components/BookTile";

export default function Search() {
  const [results, setResults] = useState([]);
  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [resultsCount, setCount] = useState(0);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const query = queryParams.get("q") || "";
  const emotion = queryParams.get("emotion") || "";
  const filter = queryParams.get("filter") || "all";
  const sort = queryParams.get("sort") || "asc";

  const visiblePages = 5;
  const start = Math.max(1, page-2);
  const end = Math.min(totalPages, start+visiblePages-1)

  useEffect(() => {
    if (query.trim() !== "" || emotion) {
      const url = `/main/search?` +
      (query ? `q=${encodeURIComponent(query)}&` : '') +
      (emotion ? `emotion=${encodeURIComponent(emotion)}&` : '') +
      `filter=${filter}&sort=${sort}&page=${page}&limit=${limit}`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || [])
          setTotalPages(Math.ceil(data.total_count / limit))
          setCount(data.total_count)
        })
        .catch((err) => console.error(err));
    }
  }, [query, emotion, filter, sort, page]);

  useEffect(() => {
      loadBooks();
  }, []);

  const loadBooks = async() =>{
    try{

      const favRes = await fetch("/auth/favorites", {credentials: "include"})
      const favData = await favRes.json();
      setFavorites(favData.favorites || []);
      
      const wishRes = await fetch("/auth/wishlist", {credentials: "include"})
      const wishData = await wishRes.json();
      setWishlist(wishData.wishlist || []);
    } catch(err){
      console.error("Load error", err)
    }
  } 

  const handleFilterChange = (e) => {
    queryParams.set("filter", e.target.value);
    setQueryParams(new URLSearchParams(queryParams));
  };

  const handleSortChange = (e) => {
    queryParams.set("sort", e.target.value);
    setQueryParams(new URLSearchParams(queryParams));
  };

  const addFavorite = async (bookId) => {
    const response = await fetch("/auth/add_favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    }).then(response => response.json())
    .then((data) => {
      setFavorites(prev => [...prev, {_id: bookId}])
      alert(data.message);
    })
  };

  const addWishlist = async (bookId) => {
    const response = await fetch("/auth/add_wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    }).then(response => response.json())
    .then((data) => {
      setWishlist(prev=>[...prev, {_id: bookId}])
      alert(data.message);
    })
  };

  const removeFromFavorites = async (bookId) => {
        try{
        const response = await fetch(`/auth/remove_favorite/${bookId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if(response.ok){
            setFavorites(favorites.filter(book => book._id !== bookId));
        }
        } catch(err){
        alert("Błąd podczas usuwania z ulubionych");
        }
    };

  const removeFromWishlist = async (bookId) => {
        try{
        const response = await fetch(`/auth/remove_wishlist/${bookId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if(response.ok){
            setWishlist(wishlist.filter(book => book._id !== bookId));
        }
        } catch(err){
        alert("Błąd podczas usuwania z listy życzeń.");
        }
    };

  const btnStyle = {
    padding: "12px 20px",
    fontSize: "15px",
    border: "2px solid #D4C9BE",
    borderRadius: "10px",
  }

  return (
    <Layout pageTitle={emotion ? (emotion=="neutral" ? `Książki dla emocji: „Nieodkryte”` : `Książki dla emocji: „${emotion}”`) :`Wyniki wyszukiwania dla „${query}”`}>
      <div className="search-page">
        <form id="filter-form" style={{ marginBottom: "2rem", marginLeft: "40%"}}>
          <label>Liczba wyników: {resultsCount}</label><br/>
          <br />
          <div className="filter-controls">
          <div>

          <label style={{ marginLeft: "2rem" }}>Filtry: </label>
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">Wszystko</option>
            <option value="books">Książki</option>
            <option value="authors">Autorzy</option>
            <option value="category">Kategorie</option>
          </select>
          </div>

          <div>
          <label style={{ marginLeft: "2rem" }}>Sortuj: </label>
          <select value={sort} onChange={handleSortChange}>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
            <option value="score_desc">Od najlepszych</option>
            <option value="score_asc">Od najgorszych</option>
          </select>
          </div>
          </div>
        </form>

        {results.length > 0 ? (
          <AnimatedList
            items={results}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={false}
            onItemSelect={(book, index) => navigate(`/book/${book._id}`)}
            renderItem={
              (book, index, selected) => (
                <BookTile
                  book={book}
                  selected={selected}
                  onAddToFavorites={addFavorite}
                  onAddToWishlist={addWishlist}
                  onRemoveFromFavorites={removeFromFavorites}
                  onRemoveFromWishlist={removeFromWishlist}
                  isFavorite={favorites.some(f => f._id === book._id)}
                  isWishlist={wishlist.some(w => w._id === book._id)}
                  onClick={() => navigate(`/book/${book._id}`)}
                  />
              )}
              />
            ) : (
              <p style={{
                textAlign: "center",
                fontSize: "20px",
                fontWeight: "600"
              }}>Brak wyników dla podanego zapytania.</p>
            )}
            </div>

        <div className="pagination">
          {Array.from({ length: end-start +1}, (_, i) => start +i).map(num => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={num === page ? "active" : ""}>
                {num}
              </button>
          ))}
        </div>

        <div className="pagination-nav">
          <button 
            disabled={page===1}
            onClick={()=> setPage(p => p-1)}
            style={btnStyle}>
              Poprzednia
            </button>
            <button 
              disabled={page===totalPages}
              onClick={() => setPage(p=> p+1)}
              style={btnStyle}>
                Następna
              </button>
        </div>
    </Layout>
  );
}
