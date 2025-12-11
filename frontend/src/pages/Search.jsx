import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AnimatedList from "../components/AnimatedList";

export default function Search() {
  const [results, setResults] = useState([]);
  const [queryParams, setQueryParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [resultsCount, setCount] = useState(0);
  const navigate = useNavigate();

  const query = queryParams.get("q") || "";
  const emotion = queryParams.get("emotion") || "";
  const filter = queryParams.get("filter") || "all";
  const sort = queryParams.get("sort") || "asc";

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
      alert(data.message);
    })
  };

  return (
    <Layout pageTitle={emotion ? (emotion=="neutral" ? `Książki dla emocji: „Nieodkryte”` : `Książki dla emocji: „${emotion}”`) :`Wyniki wyszukiwania dla „${query}”`}>
      <div className="search-page">
        <form id="filter-form" style={{ marginBottom: "2rem", marginLeft: "40%"}}>
          <label>Liczba wyników: {resultsCount}</label><br/>
          <br />
          <label>Filtry: </label>
          <select value={filter} onChange={handleFilterChange}>
            <option value="all">Wszystko</option>
            <option value="books">Książki</option>
            <option value="authors">Autorzy</option>
            <option value="categories">Kategorie</option>
          </select>

          <label style={{ marginLeft: "2rem" }}>Sortuj: </label>
          <select value={sort} onChange={handleSortChange}>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
            <option value="score_desc">Od najlepszych</option>
            <option value="score_asc">Od najgorszych</option>
          </select>
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
              <div style={{ 
                display: "flex", 
                gap: "1rem", 
                backgroundColor: "#123458", 
                alignItems: "flex-start", 
                padding: "1rem",
                justifyContent: "space-between", }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flex:1, backgroundColor: "#123458", textAlign: "center"}}>
                <div style={{
                  display: "flex", 
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#123458",
                  gap: "0.5rem",
                  justifyContent: "center",
                  }}>

                <img
                  src={book.coverImage}
                  alt={book.Title}
                  style={{
                    width: "100px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "6px", 
                    /*                     paddingRight: "1rem" */
                  }}
                  />
                  <div style={{ 
                    color: "white",
                    backgroundColor: "#123458",
                    fontSize: "18px",
                    textAlign: "center"}}>
                    {book.rating}
                    <img
                      src="../img/wishlist_icon_hover.png"
                      alt="wishlist"
                      style={{ 
                        paddingLeft: "8px",
                        cursor: "pointer", 
                        backgroundColor: "#123458",
                        width: "20px", 
                        height: "20px"}}
                      />
                  </div>

                  </div>
                <div>

                  <div style={{color: "white", backgroundColor: "#123458", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "flex-start", flex:1}}>

                  <p className="item-text" style={{ whiteSpace: "pre-line", backgroundColor: "#123458", textAlign: "center", fontSize: "20px", paddingBottom: "20px", width: "100%"}}>
                    {book.title + "\n"}
                  </p>
                  <p className="item-text" style={{ whiteSpace: "pre-line", backgroundColor: "#123458", textAlign: "center", width: "100%"  }}>
                    {
                    "Autor: " + book.authors.map(author => author.name)+ "\n\n" +
                    "Kategoria: " + String(book.category).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '') + "\n\n"+
                    (book.shortDescription ? "Krótki opis: " + book.shortDescription + "\n\n": "")
                    }
                  </p>
                  </div>
                </div>

                  <div style={{ 
                    display: "flex", 
                    backgroundColor: "#123458", 
                    flexDirection: "column", 
                    gap: "0.5rem",
                    alignItems: "center"
                    }}>

                    <img
                      src="../img/favorites_icon.png"
                      alt="favorites"
                      style={{
                        cursor: "pointer", 
                        backgroundColor: "#123458", 
                        width: "45px", 
                        height: "7%"}}
                      onMouseOver={(e) => (e.currentTarget.src = "../../img/favorites_icon_hover.png")}
                      onMouseOut={(e) => (e.currentTarget.src = "../../img/favorites_icon.png")}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await addFavorite(book._id)
                      }}
                      
                      />

                    <img
                      src="../img/wishlist_icon.png"
                      alt="wishlist"
                      style={{ 
                        cursor: "pointer", 
                        backgroundColor: "#123458",
                        width: "45px", 
                        height: "7%"}}
                      onMouseOver={(e) => (e.currentTarget.src = "../../img/wishlist_icon_hover.png")}
                      onMouseOut={(e) => (e.currentTarget.src = "../../img/wishlist_icon.png")}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await addWishlist(book._id)
                      }} 
                      />
                  </div>
                </div>

              </div>
            )}
          />

        ) : (
          <p>Brak wyników dla podanego zapytania.</p>
        )}
      </div>

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => setPage(num)}
            style={{
              margin: "0 5px",
              padding: "5px 10px",
              backgroundColor: num === page ? "#5555ff" : "#eee",
              color: num === page ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
    >
      {num}
    </button>
  ))}
</div>

<div style={{ marginTop: "1rem", textAlign: "center" }}>
  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} class="light-btn" style={{marginRight: "20px"}}>Poprzednia</button>
  <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} class="light-btn">Następna</button>
</div>
    </Layout>
  );
}
