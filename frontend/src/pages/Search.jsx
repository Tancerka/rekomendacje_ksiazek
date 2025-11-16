import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import AnimatedList from "../components/AnimatedList";

export default function Search() {
  const [results, setResults] = useState([]);
  const [queryParams, setQueryParams] = useSearchParams();
  const navigate = useNavigate();

  const query = queryParams.get("q") || "";
  const filter = queryParams.get("filter") || "all";
  const sort = queryParams.get("sort") || "asc";

  useEffect(() => {
    if (query.trim() !== "") {
      fetch(`/main/search?q=${query}&filter=${filter}&sort=${sort}`)
        .then((res) => res.json())
        .then((data) => setResults(data.results || []))
        .catch((err) => console.error(err));
    }
  }, [query, filter, sort]);

  const handleFilterChange = (e) => {
    queryParams.set("filter", e.target.value);
    setQueryParams(new URLSearchParams(queryParams));
  };

  const handleSortChange = (e) => {
    queryParams.set("sort", e.target.value);
    setQueryParams(new URLSearchParams(queryParams));
  };

  const addFavorite = async (bookId) => {
    await fetch("/auth/add_favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    });
  };

  return (
    <Layout pageTitle={`Wyniki wyszukiwania dla „${query}”`}>
      <div className="search-page">
        <form id="filter-form" style={{ marginBottom: "2rem", marginLeft: "40%"}}>
          <label>Liczba wyników: {results.length}</label><br/>
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
          </select>
        </form>

        {results.length > 0 ? (
          <AnimatedList
            items={results}
            showGradients={true}
            enableArrowNavigation={true}
            displayScrollbar={false}
            onItemSelect={(book, index) => navigate(`/book/${book._id}`)}
            renderItem={(book, index, selected) => (
              <div style={{ display: "flex", gap: "1rem", backgroundColor: "#123458" }}>
                
                <img
                  src={book.image}
                  alt={book.Title}
                  style={{
                    width: "60px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                />
                <div>
                  <p style={{ margin: 0, color: "white", backgroundColor: "#123458"  }}>
                    {index + 1} / {results.length}
                  </p>

                  <p className="item-text" style={{ whiteSpace: "pre-line", backgroundColor: "#123458"  }}>
                    {book.Title + "\n" +
                    "Autor: " + book.authors + "\n" +
                    "Kategoria: " + book.categories}
                  </p>

                  <div style={{ display: "flex", backgroundColor: "#123458"  }}>
                    <img
                      src="../img/favorites_icon.png"
                      alt="favorites"
                      style={{ width: "30px", cursor: "pointer", backgroundColor: "#123458", marginLeft:"90%" }}
                      onMouseOver={(e) => (e.currentTarget.src = "../../img/favorites_icon_hover.png")}
                      onMouseOut={(e) => (e.currentTarget.src = "../../img/favorites_icon.png")}
                      onClick={() => addFavorite(book._id)}
            
                    />

                    <img
                      src="../img/wishlist_icon.png"
                      alt="wishlist"
                      style={{ width: "30px", cursor: "pointer", backgroundColor: "#123458", marginLeft: "20%"  }}
                      onMouseOver={(e) => (e.currentTarget.src = "../../img/wishlist_icon_hover.png")}
                      onMouseOut={(e) => (e.currentTarget.src = "../../img/wishlist_icon.png")}
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
    </Layout>
  );
}
