import React, { useEffect, useState } from "react";
import Layout from "../components/Layout"
import { useNavigate } from "react-router-dom";
import { load } from "cheerio";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {

    setLoading(true); 
    setError(null);
    try{
        const response = await fetch(`/auth/favorites`, {
          credentials: "include"
        });
        if(!response.ok){
          throw new Error("Błąd podczas pobierania ulubionych książek");
        }
        const data = await response.json();
        console.debug(data.favorites);
        console.debug(data.favorites.length);
        setFavorites(data.favorites);
    } catch (err){
        setError(err.message);
    } finally {
        setLoading(false);
    }
        
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

  return (
  <Layout pageTitle = "Moje ulubione książki">

    <div style={{
      color: "#123578",
      textAlign: "center",
      fontSize: "20px",
      marginTop: "20px",
      marginBottom: "40px",
      fontWeight: "500"
    }}>
      Liczba ulubionych książek: {favorites.length}
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
    {!loading && favorites.length >0 && (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "25px",
        marginLeft: "10%",
        marginRight: "10%"
      }}>
        {favorites.map(book => (
          <BookCard
            key={book._id}
            book={book}
            onRemove={removeFromFavorites}
          />
        ))}
        </div>
    )}

    {!loading && favorites.length === 0 || favorites.length == undefined && !error &&(
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
        }}>Nie masz jeszcze ulubionych książek.</h3>
        <p style={{
          fontSize: "16px",
          color: "#7A6A62",
          marginBottom: "30px"
        }}>Dodaj książki, które lubisz do kolekcji swoich ulubionych</p>
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

function BookCard({book, onRemove}){
    const [isHovered, setIsHovered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRemove = (e) =>{
      e.stopPropagation();
      if (showConfirm) {
        onRemove(book._id);
        setShowConfirm(false)
      }else{
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 3000);
      }
    };

    const handleBookClick = () => {
      window.location.href = `/book/${book._id}`;
    }

    return(
        <div 
        onClick={handleBookClick}
        style={{
            backgroundColor: "#F5F5F0",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid #E0D9D0",
            transition: "all 0.3s ease",
            cursor: "pointer",
            transform: isHovered ? "translateY(-4px)" : "none",
            boxShadow: isHovered ? "0 8px 16px rgba(0,0,0,0.15)" : "none",
            display: "flex",
            flexDirection: "column"
            
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{
                width: "100%",
                height: "300px",
                backgroundColor: "#E0D9D0",
                backgroundImage: `url(${book.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B0A599",
                fontSize: "20px",
                position: "relative"
            }}>
                {!book.coverImage && <span>Brak okładki</span>}
            </div>
            <div style={{ padding: "15px", flexGrow: 1 }}>
                <h4 style={{
                    fontSize: "18px",
                    color: "#123578",
                    marginBottom: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    minHeight: "40px"
                }}>
                    {book.title}
                </h4>
                <p style={{
                    fontSize: "16px",
                    color: "#7A6A62",
                    marginBottom: "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>
                    {book.authors.map(a => a.name || a).join(", ")}
                </p>
                {book.rating && (
                    <span style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#5A4A42",
                        marginBottom: "30px"
                    }}>
                        Ocena: {book.rating}
                    </span>
                    
                  )}
                  <br/>

                {book.dominant_emotion && book.dominant_emotion.length > 0 &&(
                  <div style={{
                    display:"flex",
                    gap: "6px",
                    flexWrap: "wrap"
                  }}>
                    {book.dominant_emotion.map((emotion, index) => (
                  <span 
                  key={index}
                  style={{
                    fontSize: "11px",
                    backgroundColor: "#D4C9BE",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    color: "#5A4A42"
                  }}>
                    {emotion}
                  </span>
                ))}
            </div>
    )}
    </div>
              
            {book.category && (
              <p style={{
                fontSize: "12px",
                color: "#7A6A62",
                marginBottom: "12px",
                fontSTyle: "italic",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginLeft: "5px"
              }}>
                {book.category}
              </p>
            )}

            <button 
                key = {showConfirm}
                onClick={handleRemove}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#BF092F",
                    border: "none",
                    borderRadius: "8px",
                    color: showConfirm ? "white" : "#D4C9BE",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    marginTop: "auto",
/*                     marginBottom: "10px" */
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = showConfirm ? "#ff5764" : "#FF9AA2"; 
                    e.currentTarget.style.color = "black" 
                }}

                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = showConfirm ? "#800f27" : "#BF092F";
                    e.currentTarget.style.color = "#D4C9BE" 
                }}
                >
                   {showConfirm ? "Kliknij, by usunąć" : "Usuń z ulubionych"}
                </button>
            </div>
    );
    }
