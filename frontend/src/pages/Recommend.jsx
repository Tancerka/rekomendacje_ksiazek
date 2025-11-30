import React, {useEffect, useState} from "react";
import Layout from "../components/Layout"

export default function Recommend(){

    const [recommendations, setRecommendations] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const generateRecommendations = async () => {
        setLoading(true);
        setError(null);

        try{
            const response = await fetch("/main/recommendations", {
                method: "GET",
                credentials: "include"
            });

            if(!response.ok){
                throw new Error("Błąd podczas pobierania rekomendacji");
            }

            const data = await response.json();
            setRecommendations(data.recommendations || []);
        } catch (err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const addToFavorites = async (bookId) => {
        try{
        const response = await fetch("/auth/add_favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ book_id: bookId }),
        });

        if(response.ok){
            alert("Książka dodana do ulubionych!");
        }
    } catch(err){
        alert("Błąd podczas dodawania do ulubionych");

        }    
    }


    return(
        <Layout pageTitle = "Rekomendacje">
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px"}}>
                <div style={{ textAlign: "center", paddin: "40px 20px", backgroundColor: "#F9F7F4", borderRadius: "12px", marginBottom: "40px", border: "2px solid #E0D9D0", height:"10vw"}}>
                    <p style={{ fontSize: "24px", color: "#123578", marginBottom: "10px", lineHeight: "1.6"}}>Odkryj książki idealnie dopasowane do Twoich ulubionych emocji!</p>
                    <button onClick={generateRecommendations} 
                            style={{backgroundColor: "#C4B9AE",
                                    color: "white", 
                                    border: "2px solid #5A4A42", 
                                    borderRadius: "8px", 
                                    padding: "15px 40px", 
                                    fontSize: "18px", 
                                    fontWeight: "600", 
                                    cursor: loading ? "not-allowed":"pointer", 
                                    transition: "all 0.3s ease", 
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                            }}
                            onMouseOver = {(e) => {
                                if(!loading){
                                    e.currentTarget.style.color = "#C4B9AE";
                                    e.currentTarget.style.backgroundColor = "#7A6A62";
                                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
                                }
                            }}
                            onMouseOut = {(e) => {
                                if(!loading){
                                    e.currentTarget.style.color = "black";
                                    e.currentTarget.style.backgroundColor = "#C4B9AE";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                                }
                            }}
                            >
                            {loading ? "Generowanie rekomendacji..." : "Generuj rekomendacje" }  
                            </button> 
                </div>
            {error && (
                <div style={{
                    backgroundColor: "#FFE4E1",
                    color: "#8B0000",
                    padding: "20px",
                    borderRadius: "8px",
                    marginBottom: "30px",
                    border: "2px solid #FFB6C1",
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "#7A6A62",
                }}>
                    Ładowanie rekomendacji...
                </div>
            )}

            {!loading && recommendations.length > 0 && (
                <>
                <div style={{
                    marginBottom: "30px",
                    display:"flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h3 style={{ fontSize: "24px", color: "#123578", margin: 0}}>Znaleziono {recommendations.length} książek dla Ciebie</h3>
                </div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px"
                }}>
                    {recommendations.map((book) => (
                        <BookCard
                            key={book._id}
                            book={book}
                            onAddToFavorites={() => addToFavorites(book._id)}
                        />
                    ))}
                </div>
                </>
            )}

            {!loading && recommendations.length === 0 && !error && (
                <div style={{
                    textAlign: "center",
                    padding: "80px 20px",
                    backgroundColod: "#f9f7f4",
                    borderRadius: "12px",
                    border: "2px dashed #E0D9D0"
                }}>
                    <div style={{
                        fontSize: "48px",
                        marginBottom: "20px"
                    }}>📚</div>
                    <h3 style={{
                        fontSize: "24px",
                        color: "#123578",
                        marginBottom: "10px"
                    }}>Brak rekomendacji</h3>
                    <p style={{ color: "#7A6A62"}}>
                        Dodaj książki do ulubionych, aby otrzymać spersonalizowane rekomendacje!
                    </p>
                </div>
            )}
            </div>
        </Layout>
    )
}

function BookCard({book, onAddToFavorites}){
    const [isHovered, setIsHovered] = useState(false);
    return(
        <div style={{
            backgroundColor: "#F5F5F0",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid #E0D9D0",
            transition: "all 0.3s ease",
            cursor: "pointer",
            transform: isHovered ? "translateY(-4px)" : "none",
            boxShadow: isHovered ? "0 8px 16px rgba(0,0,0,0.15)" : "none"
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
                fontSize: "20px"
            }}>
                {!book.coverImage && <span>Brak okładki</span>}
            </div>
            <div style={{ padding: "15px" }}>
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
                        color: "#5A4A42"
                    }}>
                        Emocja: {book.dominant_emotion.map(e => e.name).join(", ")} | Ocena: {book.rating}
                    </span>
                )}
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onAddToFavorites();
                }}
                style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#C4B9AE",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#FF9AA2";  
                }}

                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFB6C1";
                }}
                >
                   ❤️ Dodaj do ulubionych
                </button>
            </div>
    );
    }