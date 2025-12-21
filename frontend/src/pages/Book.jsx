import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import Layout from "../components/Layout"

export default function Book(){

    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [addingToFavorites, setAddingToFavorites] = useState(false);
    const [isWishlist, setIsWishlist] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);

    useEffect(() =>{
        fetch(`/main/book?id=${id}`)
        .then((res)=>res.json())
        .then((data) => setBook(data))
        .catch((err)=>console.error(err))

        fetch(`/auth/book_status/${id}`, {credentials: "include"})
        .then(res=>res.json())
        .then(data=> {
          setIsFavorite(data.isFavorite);
          setIsWishlist(data.isWishlist)
        })
    }, [id]);

  const addFavorite = async (bookId) => {
    setAddingToFavorites(true);
    setIsFavorite(true);
    const res = await fetch("/auth/add_favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    })
    const data = await res.json()
    if(res.ok){
      alert(data.message);
      setIsFavorite(true);
    }else{
      setIsFavorite(false);
      alert(data.error || "Błąd")
    }
    setAddingToFavorites(false);
  };

  const addWishlist = async (bookId) => {
    setAddingToWishlist(true);
    setIsWishlist(true);
    const res = await fetch("/auth/add_wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    })
    const data = await res.json()
    if(res.ok){
      console.debug(data)
      alert(data.message);
      setIsWishlist(true);
    }else{
      setIsWishlist(false);
      alert(data.error || "Błąd")
    }
    setAddingToWishlist(false);
  };

    if(!book) return <Layout pageTitle = "Ładowanie..."></Layout>  ;

    return(
<Layout pageTitle = {book.title}>
    <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px 40px"
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "40px",
        marginBottom: "40px"
      }}>
        <div>
          <div style={{
            backgroundColor: "#E0D9D0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            marginBottom: "3px solid #D4C9BE"
          }}>
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                style={{
                  width: "100%",
                  display: "block"
                }}
                />
              ) : (
                <div style={{
                  height: "400px",
                  display: "flex",
                  justifyContent: "center",
                  color: "#B0A599",
                  fontSize: "16px"
                }}> 
                Brak okładki
                </div>

            )}
          </div>
        <button
          onClick={() => addFavorite(book._id)}
          disabled={isFavorite || addingToFavorites}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: isFavorite ? "#eaffeaff" : "#FFB6C1",
            border: "2px solid #5A4A42",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#5A4A42",
            cursor: isFavorite || addingToFavorites ? "not-allowed" : "pointer",
            marginBottom: "10px",
            transition: "all 0.2s ease",
            marginTop: "15px"
          }}
          onMouseOver = {(e) => {
            if(!isFavorite && !addingToFavorites){
              e.currentTarget.style.backgroundColor = "#FF9AA2";
            }
          }}
          onMouseOut={(e) => {
            if(!isFavorite && !addingToFavorites){
            e.currentTarget.style.backgroundColor = "#FFB6C1"
            }
          }}>
            {isFavorite ? "W ulubionych" : addingToFavorites ? "Dodawanie..." : "Dodaj do ulubionych"}
          </button>

          <button
          onClick={() => addWishlist(book._id)}
          disabled={isWishlist || addingToWishlist}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: isWishlist ? "#eaffeaff" : "#E6E6FA",
            border: "2px solid #5A4A42",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#5A4A42",
            cursor: isWishlist || addingToWishlist ? "not-allowed" : "pointer",
            marginBottom: "10px",
            transition: "all 0.2s ease",
            marginTop: "15px"
          }}
          onMouseOver = {(e) => {
            if(!isWishlist && !addingToWishlist){
              e.currentTarget.style.backgroundColor = "#d3d3ffff";
            }
          }}
          onMouseOut={(e) => {
            if(!isWishlist && !addingToWishlist){
            e.currentTarget.style.backgroundColor = "#E6E6FA"
            }
          }}>
            {isWishlist ? "Na liście życzeń" : addingToWishlist? "Dodawanie..." : "Dodaj do listy życzeń"}
          </button>
          <div>
              <div style={{
                display: "flex",
                gap: "15px",
                marginBottom: "25px",
                flexWrap: "wrap"
              }}>
              {book.rating &&(
            <div style={{
              backgroundColor: "#fffadeff",
              padding: "10px 20px",
              borderRadius: "25px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#5A4A42",
              border: "2px solid #ffdc82ff"
            }}>
              ⭐ {book.rating}
              {book.ratingsCount && (
                <span style={{
                  fontSize: "14px",
                  marginLeft: "8px"
                }}>
                  ({book.ratingsCount} ocen)
                </span>
              )}
            </div>
            )}
            {book.dominant_emotion && book.dominant_emotion.length > 0 && (
              book.dominant_emotion.map((emotion, idx) => (
                <div 
                key={idx}
                style={{
                  backgroundColor: "#bdd4ffff",
                  padding: "10px 20px",
                  borderRadius: "25px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#5A4A42",
                  border: "2px solid #0e005bff"
                }}>
                  {emotion}
                  </div>
              ))
            )}
          </div>
          
          <div style={{
            backgroundColor: "#F9F7F4",
            padding: "30px",
            borderRadius: "15px",
            border: "2px solid #E0D0D0",
            marginBottom: "30px"
          }}>
            <InfoRow label="Autor" value={book.authors.map(a => a.name || a).join(", ")} />  
              {book.publisher && <InfoRow label="Wydawnictwo" value={book.publisher} /> }
              {book.category && <InfoRow label="Kategoria" value={book.category} /> }
              {book.pages && <InfoRow label="Liczba stron" value={book.pages + " str."} />}
              {book.releaseDate && <InfoRow label="Data wydania" value={book.releaseDate} /> }          
              {book.isbn && <InfoRow label="ISBN" value={book.isbn} /> }
              </div>
              {(book.longDescription || book.shortDescription) && (
                <div style={{
                  backgroundColor: "#F9F7F4",
                  padding: "30px",
                  borderRadius: "15px",
                  border: "2px solid #E0D9D0"
                }}>
                  <h3 style={{
                    fontSize: "22px",
                    color: "#5A4A42",
                    marginBottom: "15px",
                    fontWeight: "600"
                  }}>
                    Opis fabuły
                  </h3>
                  <p style={{
                    fontSize: "16px",
                    lineHeight: "1.8",
                    color: "#5A4A42",
                    margin: 0
                  }}>
                    {book.longDescription || book.shortDescription}
                  </p>
                  </div>
              )}
      </div>
    </div>

    {book.reviews && book.reviews.length >0 && (
      <div style={{
        backgroundColor: "#F9F7F4",
        padding: "30px",
        borderRadius: "15px",
        border: "2px solid #E0D9D0"
      }}>
        <h3 style={{
          fontSize: "22px",
          color: "#5A4A42",
          marginBottom: "20px",
          fontWeight: "600"
        }}>
          Recenzje ({book.reviews.length})
        </h3>
        <div style={{
          display: "grid",
          gap: "20px"
        }}>
          {book.reviews.map((review, idx) => (
            <ReviewCard key={idx} review={review} />
          ))}
          </div>
        </div>
    )}
        </div> 
    </div> 
</Layout>  
    );
}

function InfoRow({ label, value}) {
  return (
    <div style={{
      marginBottom: "15px"
    }}>
      <span style={{
        fontWeight: "bold",
        color: "#5A4A42",
        fontSize: "15px",
        marginRight: "8px"
      }}>
        {label}: 
      </span>
      <span style={{
        color: "#7A6A62",
        fontSize: "15px"
      }}>
        {value}
      </span>
    </div>
  );
}

function ReviewCard({review}) {
  return(
    <div style={{
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "12px",
      border: "2px solid #E0D9D0",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
      }}>
        <div>
          <span style={{
            fontWeight: "600",
            color: "#5A4A42",
            fontSize: "16px"
          }}>
            {review.author}
          </span>
          {review.rating && (
            <span style={{
              marginLeft: "12px",
              fontSize: "14px",
              color: "#FFD700",
              fontWeight: "bold"
            }}>
              ⭐ {review.rating}/10
            </span>
          )}
        </div>
        {review.date && (
          <span style={{
            fontSize: "13px",
            color: "#B0A599"
          }}>
            {review.date}
          </span>
        )}
      </div>
      <p style={{
        fontSize: "15px",
        lineHeight: "1.6",
        color: "#5A4A42",
        margin: "0 0 12px 0"
      }}> 
        {review.text}
      </p>

      {review.emotions && review.emotions.length > 0 && (
        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}>
          {review.emotions.map((emotion, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: "#E6E6FA",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#5A4A42"
              }}>
                {emotion}
              </span>
          ))}
          </div>
      )}
    </div>
  )
}