import React, { useEffect, useState } from "react";
import Layout from "../components/Layout"

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() =>{
          fetch(`/auth/favorites`)
          .then((res)=>res.json())
          .then((data) => setFavorites(data))
          .catch((err)=>console.error(err))
      }, []);

  return (
  <Layout pageTitle = "Ulubione">
    <div>
      {favorites.length > 0 ? (
        <ul>
          {favorites.map((book) => (
            <button
              key={book._id}
              className="book-item"
              /* onClick={window.location.href = `/main/book?id=${book._id}`} */
            >
            <h3 style={{fontWeight: "bold"}}>{ book.Title }</h3>
            <span style={{fontWeight: "bold"}}>Autor: </span>{ String(book.authors).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '')} <br/><br/>
            <span style={{fontWeight: "bold"}}>Kategoria: </span>{ String(book.categories).replace(/\[/g, '').replace(/\]/g, '').replace(/'/g, '') } <br/><br/>
            </button>
          ))}
        </ul>
      ) : (
        <p>Brak ulubionych książek.</p>
      )}
    </div>
  </Layout>
  );
}
