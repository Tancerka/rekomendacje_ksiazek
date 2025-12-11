import React, {useEffect, useState} from "react";
import Layout from "../components/Layout"
import BookCard from "../components/BookCard";

export default function Wishlist(){
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {

    setLoading(true); 
    setError(null);
    try{
        const response = await fetch(`/auth/wishlist`, {
          credentials: "include"
        });
        if(!response.ok){
          throw new Error("Błąd podczas pobierania ulubionych książek");
        }
        const data = await response.json();
        console.debug(data.wishlist);
        console.debug(data.wishlist.length);
        setWishlist(data.wishlist);
    } catch (err){
        setError(err.message);
    } finally {
        setLoading(false);
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
      alert("Błąd podczas usuwania z ulubionych");
    }
  };

  return (
  <Layout pageTitle = "Lista życzeń">

    <div style={{
      color: "#123578",
      textAlign: "center",
      fontSize: "20px",
      marginTop: "20px",
      marginBottom: "40px",
      fontWeight: "500"
    }}>
      Liczba książek na liście życzeń: {wishlist.length}
    </div>

    {error && (
      <div style={{
        backgroundColor: "#FFE4E1",
        color: "#8B0000",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "30px",
        border: "2px solid #FFB6C1"
      }}> {error} </div>
    )}
    {!loading && wishlist.length >0 && (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "25px",
        marginLeft: "10%",
        marginRight: "10%"
      }}>
        {wishlist.map(book => (
          <BookCard
            key={book._id}
            book={book}
            onAction={removeFromWishlist}
            actionLabel="Usuń z ulubionych"
            actionConfirmLabel={"Czy na pewno chcesz usunąć?"}
          />
        ))}
        </div>
    )}

    {!loading && wishlist.length === 0 || wishlist.length == undefined && !error &&(
      <div style={{
        textAlign: "center",
        padding: "80px 20px",
        backgroundColor: "#F9F7F4",
        borderRadius: "12px",
        border: "2px dashed #E0D9D0"
      }}>
        <div style={{
          fontSize: "64px",
          marginBottom: "20px"
        }}>
          ❤️
        </div>
        <h3 style={{
          fontSize: "24px", 
          color: "#5A4A42",
          marginBottom: "10px"
        }}>Nie masz jeszcze książek na liście życzeń.</h3>
        <p style={{
          fontSize: "16px",
          color: "#7A6A62",
          marginBottom: "30px"
        }}>Dodaj książki, które chcesz przeczytać</p>
        <button 
          onClick={() => window.location.href= "/"}
          style={{
            backgroundColor: "#D4C9BE",
            border: "2px solid #5A4A42",
            borderRadius: "12px",
            padding: "12px 30px",
            fontSize: "16px",
            color: "#5A4A42",
            cursor: "pointer",
            frontWeight: "500"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor ="#C4B9AE";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor ="#D4C9BE";
          }}
          >Przeglądaj książki
          </button>
      </div>
    )}
  </Layout>
  );
}