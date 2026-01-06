import React, {useEffect, useState} from "react";
import Layout from "../components/Layout"

export default function Recommend(){

    const [recommendations, setRecommendations] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeDirection, setSwipeDirection] = useState(null)
    const [basedOn, setBasedOn] = useState(null)
    const [offset, setOffset]= useState(0);
    const limit = 15;

    useEffect(() => {
        generateRecommendations();
    }, []);

    const generateRecommendations = async () => {
        setLoading(true);
        setError(null);

        try{
            const response = await fetch(`/main/recommendations?offset=${offset}&limit=${limit}`, {
                method: "GET",
                credentials: "include"
            });

            if(!response.ok){
                throw new Error("Błąd podczas pobierania rekomendacji");
            }

            const data = await response.json();
            setRecommendations(data.recommendations || []);
            setBasedOn(data.basedOn);
            setCurrentIndex(0);
            setOffset(prev => prev +15);
        } catch (err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const handleSwipe = async (direction) => {
        const currentBook = recommendations[currentIndex];

        setSwipeDirection(direction);
        if(direction === "right"){
            try{
                addToWishlist(currentBook._id);
                
            }catch(err){
                console.error("Błąd dodawania do listy życzeń:", err);
            }
        }

        setTimeout(() => {
            setSwipeDirection(null);
            setCurrentIndex(currentIndex+1);
        }, 300);

    }
    const currentBook = recommendations[currentIndex];
    const hasMore = currentIndex < recommendations.length;
    const progress = recommendations.length > 0 
    ? ((currentIndex / recommendations.length) * 100).toFixed(0) : 0;

    const addToWishlist = async (bookId) => {
        try{
        const response = await fetch("/auth/add_wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ book_id: bookId }),
        });

        if(response.ok){
            alert("Książka dodana do listy życzeń!");
        }
    } catch(err){
        alert("Błąd podczas dodawania do listy życzeń.");

        }    
    }


    return(
        <Layout pageTitle = "Rekomendacje">
            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px"}}>
                {basedOn && (
                    <div style={{
                        backgroundColor: "#F9F7F4",
                        padding: "15px 20px",
                        borderRadius: "12px",
                        marginBottom: "30px",
                        border: "2px solid #E0D9D0",
                        fontSize: "20px",
                        color: "#7A6A62"
                    }}>
                        Rekomendacje na podstawie: {basedOn.topEmotions?.length > 0 && (
                            <><strong>{basedOn.topEmotions.join(", ")}</strong><br/></>
                        )}
                        {basedOn.avgRating && `Średni rating: ${basedOn.avgRating}`}
                        </div>
                )}

            {!loading && hasMore && (
                <div style={{
                    marginBottom: "30px"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        fontSize: "14px",
                        color: "#7A6A62"
                    }}>
                        <span> Książka {currentIndex + 1} z {recommendations.length}</span>
                        <span>{progress}%</span>
                    </div>
                    <div style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#E0D9D0",
                        borderRadius: "4px",
                        overflow: "hidden"
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: "100%",
                            backgroundColor: "#D4C9BE",
                            transition: "width 0.3s ease"
                        }} /> 
                        </div>
                    </div>
            )}
                
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
                   <p style={{fontSize: "18px"}}> Ładowanie rekomendacji...</p>
                </div>
            )}

            {!loading && hasMore && currentBook && (
                <div style={{
                    position: "relative",
                    marginTop: "30px",
                    justifyContent: "center"
                }}>
                    <BookCard
                        book={currentBook}
                        swipeDirection={swipeDirection}
            />
            <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "30px",
                marginTop: "30px"
            }}>
                <button
                    onClick={() => handleSwipe('left')}
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "3px solid #FF6B6B",
                        backgroundColor: "white",
                        fontSize: "32px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#FF6B6B";
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                    >
                        x
                    </button>

                <button
                    onClick={() => handleSwipe('right')}
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "3px solid #4CAF50",
                        backgroundColor: "white",
                        fontSize: "32px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#4CAF50";
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                    >
                        ❤️
                    </button>
            </div>
            <div style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "14px",
                color: "#7A6A62"
            }}>
                <p>x Pomiń • ❤️ Dodaj do listy życzeń</p>
            </div>
        </div>
            )}

            {!loading && !hasMore && recommendations.length > 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    backgroundColod: "#f9f7f4",
                    borderRadius: "12px",
                    border: "2px solid #E0D9D0"
                }}>
                    <div style={{
                        fontSize: "35px",
                        marginBottom: "20px",
                        overflowWrap: "break-word",
                        wordBreak: "break-word"

                    }}>Przejrzałeś wszystkie rekomendacje</div>
                    <p style={{fontSize: "16px", color: "#7A6A62", marginBottom: "30px"}}>
                        Przejrzano {recommendations.length} książek 
                    </p>
                    <button 
                        onClick={generateRecommendations}
                        style={{
                            backgroundColor: "#D4C9BE",
                            border: "2px solid #5A4A42",
                            borderRadius: "8px",
                            padding: "15px 30px",
                            fontSize: "16px",
                            color: "#5A4A42",
                            cursor: "pointer",
                            fontWeight: "500",
                            height: "auto",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#C4B9AE";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#D4C9BE";
                        }}>
                            Wygeneruj nowe rekomendacje
                        </button>
                </div>
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
                    <button 
                        onClick={() => window.location.href = "/"}
                        style={{
                            backgroundColor: "#D4C9BE",
                            border: "2px solid #5A4A42",
                            borderRadius: "12px",
                            padding: "12px 30px",
                            fontSize: "16px",
                            color: "#5A4A42",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}>
                        Przeglądaj książki
                    </button>
                </div>
                )}
            </div>
        </Layout>
    )
}

function BookCard({book, swipeDirection}){
    return(
        <div style={{
            display: "flex",
            width: "100%",
            backgroundColor: "#F5F5F0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            border: "3px solid #E0D9D0",
            transition: "all 0.3s ease",
            transform: swipeDirection === 'left' 
            ? "translateX(-100%) rotate(-10deg)"
            : swipeDirection === 'right'
            ? "translateX(100%) rotate(10deg)"
            : "none",
            opacity: swipeDirection ? 0 : 1,
            margin: "0 auto",
            minWidth: "0",
            flex: 1
        }}>
            <div style={{
                flex: "0 0 40%",
                minWidth: "20vw",
                height: "450px",
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
                {book.score !== undefined && (
                    <div style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        backgroundColor: "#D4C9BE",
                        padding: "10px 15px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#5A4A42",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                    }}>
                        Match: {Math.round(book.score * 10)}%
                    </div>
                )}
            </div>
            <div style={{ padding: "30px" }}>
                <h2 style={{
                    fontSize: "24px",
                    color: "#123578",
                    marginBottom: "10px",
                    fontWeight: "600",
                    display: "-webkit-box",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                }}>
                    {book.title}
                </h2>
                <p style={{
                    fontSize: "16px",
                    color: "#7A6A62",
                    marginBottom: "15px",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                }}>
                    {book.authors.map(a => a.name || a).join(", ")}
                </p>
                <div style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "20px",
                    flexWrap: "wrap"
                }}>
                    {book.rating && (
                        <span style={{
                        backgroundColor: "#fffadeff",
                        padding: "6px 12px",
                        borderRadius: "15px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#5A4A42"
                        }}>
                            {book.rating} ⭐
                        </span>
                    )}
                    {book.dominant_emotion && book.dominant_emotion.length > 0 && (
                        book.dominant_emotion.map(emotion=> (
                            <span style={{
                                backgroundColor: "#FFB6C1",
                                padding: "6px 12px",
                                borderRadius: "15px",
                                fontSize: "14px",
                                color: "#5A4A42"
                            }}>
                            {emotion}
                        </span>
                        ))
                    )}
                    {book.pages && (
                        <span style={{
                            backgroundColor: "#E6E6FA",
                            padding: "6px 12px",
                            borderRadius: "15px",
                            fontSize: "14px",
                            color: "#5A4A42"
                        }}>
                            {book.pages} str.
                        </span>
                    )}
                </div>
                {book.category && (
                    <p style={{
                        fontSize: "14px",
                        color: "#7A6A62",
                        fontStyle: "italic",
                        marginBottom: "15px",
                        overflowWrap: "break-word",
                        wordBreak: "break-word"
                    }}>
                        <strong>Kategoria: </strong> {book.category}
                    </p>
                )} 
                {book.shortDescription && (
                    <p style={{
                        fontSize: "15px",
                        color: "#7A6A62",
                        lineHeight: "1.6",
                        marginTop: "15px",
                        overflowWrap: "break-word",
                        wordBreak: "break-word"
                    }}>
                        {book.shortDescription}
                    </p>
                )}
                 </div>
        </div>
    );
    }