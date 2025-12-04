import React, {useEffect, useState} from "react";
import Layout from "../components/Layout"
import BookCard from "../components/BookCard"

export default function Profile(){

    const [activeTab, setActiveTab] = useState("recommendations");
    const [recommendations, setRecommendations] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [edit, setEdit] = useState([])
    const [profile, setProfile] = useState({username: "", email: ""});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try{
            const favRes = await fetch("/auth/favorites", {credentials: "include"})
            const favData = await favRes.json();
            setFavorites(favData.favorites || []);

            const profileRes = await fetch("auth/profile", {credentials: "include"});
            const profileData = await profileRes.json()
            setProfile(profileData);
        }catch(err){
            console.error("Load error", err)
        }
        setLoading(false);
        }
    
    const tabs = [
        { id: "recommendations", label: "Twoje rekomendacje", count: recommendations.length},
        { id: "favorites", label: "Ulubione książki", count: favorites.length},
        { id: "wishlist", label: "Lista życzeń", count: wishlist.length},
        { id: "edit", label: "Edycja profilu"}
    ]

    const getCurrentBooks = () => {
        switch(activeTab) {
            case "recommendations": return recommendations;
            case "favorites": return favorites;
            case "wishlist": return wishlist;
            case "edit": return edit;
            default: return [];
        
        }
    }

    const calculateAverageRating = () => {
        if (favorites.length === 0) return "-";
        const sum = favorites
                    .map(b => Number(b.rating) || 0)
                    .reduce((a,b) => a+b,0);
        return (sum/favorites.length).toFixed(2);
    }

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

    const removeFromWishlist = (bookId) => {
        setWishlist(wishlist.filter(book => book.id !== bookId));
    }

    const addToFavorites = (book) => {
        if(!favorites.find(b => b.id === book.id)){
            setFavorites([... favorites, book]);
        }
    }

    const addToWishlist = (book) => {
        if(!wishlist.find(b => b.id === book.id)){
            setWishlist([... wishlist, book]);
        }
    }

    const editProfile = async () => {
        await fetch("/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(profile)
        });
        alert("Zapisano zmiany");
    }

    const inputStyle = {
        width: "100%",
        padding: "10px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: "1px solid #ccc"
    }

    const BtnStyle = {
        width: "10vw",
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: "#7A6A62",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        color: "white",
        alignItems: "center",
        justifyContent: "center"
    }


    return(
    <Layout pageTitle = "Mój profil">
        <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 20px"
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "40px"
            }}>
                <StatCard
                    icon="📚"
                    value={recommendations.length}
                    label="Rekomendacji"
                    color="#D4C9BE"
                    />
                <StatCard
                    icon="❤️"
                    value={favorites.length}
                    label="Ulubionych"
                    color="#FFB6C1"
                />
                <StatCard
                    icon="📖"
                    value={wishlist.length}
                    label="Na liście życzeń"
                    color="#E6E6FA"
                />
                <StatCard
                    icon="⭐"
                    value={calculateAverageRating()}
                    label="Średnia ocen"
                    color="#fffadeff"
                />
            </div>
            <div style={{
                display: "flex",
                gap: "10px",
                borderBottom: "2px solid #E0D9D0",
                marginBottom: "30px",
                flexWrap: "wrap"
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            backgroundColor: activeTab === tab.id ? "#D4C9BE" : "transparent",
                            border: "none",
                            padding: "15px 25px",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: activeTab === tab.id ? "600" : "400",
                            color: "#5A4A42",
                            borderBottom: activeTab === tab.id ? "3px solid #5A4A42" : "none",
/*                             transition: "all  0.3s ease", */
                            borderRadius: "8px 8px 0 0"
                        }}
                        onMouseOver={(e) => {
                            if(activeTab !== tab.id){
                                e.currentTarget.style.backgroundColor = "rgba(245, 245, 240, 0.5)";
                            }
                        }}
                        onMouseOut={(e) => {
                            if(activeTab !== tab.id){
                                e.currentTarget.style.backgroundColor = "transparent";
                            }
                        }}>
                            {(tab.id === "edit" ? tab.label : `${tab.label} (${tab.count})`)}
                        </button>
                ))}
            </div>

            {loading ? (
                <div style= {{
                    textAlign: "center",
                    padding: "60px",
                    color: "#7A6A62"
                }}> 
                Ładowanie... 
                </div>
            ) : (
                <div>
                {activeTab === "recommendations" && (
                    <div>
                        <BookGrid
                            books={getCurrentBooks()}
                            onAddToFavorites={addToFavorites}
                            onAddToWishlist={addToWishlist}
                            showActions={true}
                            />
                    </div>
                )}

                {activeTab === "favorites" && (
                    <div>
                        {favorites.length === 0 ? (
                            <EmptyState
                                icon="❤️"
                                message="Nie masz jeszcze ulubionych książek"
                                submessage="Dodaj książki do ulubionych"
                                />
                        ) : (
                            <BookGrid
                                books={getCurrentBooks()}
                                onRemove={removeFromFavorites}
                                showRemove={true}
                                removeLabel="Usuń z ulubionych"
                                />
                            )}
                        </div>
                )}
                {activeTab === "wishlist" && (
                    <div>
                        {wishlist.length == 0 ? (
                            <EmptyState
                                icon="📖"
                                message="Twoja lista życzeń jest pusta"
                                submessage="Dodaj książki, które chcesz przeczytać"
                                />
                        ): (
                            <BookGrid
                                books={getCurrentBooks()}
                                onRemove={removeFromWishlist}
                                showRemove={true}
                                removeLabel= "Usuń z listy"
                                />
                        )}
                        </div>
                    )}

                    {activeTab === "edit" && (
                        <div style={{
                            maxWidth: "500px",
                            margin: "0 auto"
                        }}>
                            <h3 style={{
                                color: "#123578",
                                fontWeight: "600"
                            }}>
                                Edytuj profil
                            </h3>
                            <label style={{
                                color: "#7A6A62"
                            }}>
                                Nazwa użytkownika
                            </label>
                            <input 
                                type="username"
                                value={profile.username}
                                onChange={(e) => setProfile({...profile, username: e.target.value})}
                                style={inputStyle}
                                />

                            <label style={{
                                color: "#7A6A62"
                            }}>
                                Email użytkownika
                            </label>
                            <input 
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                style={inputStyle}
                                />
                            <button
                                style={BtnStyle}
                                onClick={editProfile}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#645750ff";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "#7A6A62";
                                }}
                                >
                                    Zapisz zmiany
                                </button>
                                </div>
                            
                    )}
                </div>
                )}
        </div>
    </Layout>
    )
}

function StatCard({icon, value, label, color}){
    return(
        <div style={{
            backgroundColor: color,
            padding: "25px",
            borderRadius: "8px",
            textAlign: "center",
            border: "2px solid #E0D9D0",
            width: "15vw",
            position: "flex"
        }}> 
            <div style={{
                fontSize: "36px",
                marginBottom: "10px"
            }}> 
            {icon}
            </div>

            <div style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#5A4A42",
                marginBottom: "5px"
            }}>
                {value}
            </div>
            <div style={{
                fontSize: "14px",
                color: "#7A6A62",
            }}>
                {label}
            </div>
        </div>
    );
}

function BookGrid({books, onAddToFavorites, onAddToWishlist, onRemove, showActions, showRemove, removeLabel}){
    return(
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "25px"
        }}>
            {books.map(book => (
                <BookCard
                    key={book._id}
                    book={book}
                    onAddToFavorites={onAddToFavorites}
                    onAddToWishlist={onAddToWishlist}
                    onRemove={onRemove}
                    showActions={showActions}
                    showRemove={showRemove}
                    removeLabel={removeLabel}
                    />
            ))}
        </div>
    );
}

/* function BookCard({book, onAddToFavorites, onAddToWishlist, onRemove, showActions, showRemove, removeLabel}){
    const [showMenu, setMenu] = useState(false);

    return(
        <div style={{
            backgroundColor: "#F5F5F0",
            borderRadius: "8px",
            overflow: "hidden",
            border: "2px, solid, #E0D9D0",
            transition: "all 0.3s ease",
            cursor: "pointer",
            position: "relative",
            width: "10vw"
        }}

        onMouseOver={(e) => {
            e.currentTarget.style.transform ="translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform="none";
            e.currentTarget.style.boxShadow="none";
        }}>
            <div style={{
                width: "100%",
                height: "250px",
                backgroundColor: "#E0D9D0",
                backgroundImage: `url(${book.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }} />

            <div style={{ padding: "15px"}}>
                <h4 style={{
                    fontSize: "16px",
                    color: "#5A4A42",
                    marginBottom: "8px",
                    fontWeight: "600",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>
                    {book.title}
                </h4>
                <p style={{
                    fontSize: "13px",
                    color: "#7A6A62",
                    marginBottom: "10px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                }}>
                    {book.authors.join(", ")}
                </p>

                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px"
                }}>
                    <span style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#5A4A42"
                    }}>
                        ⭐ {book.rating}
                    </span>
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
            {showActions && (
                <div style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "12px"
                }}>
                <ActionButton 
                    icon="❤️"
                    onClick={() => onAddToFavorites(book)}
                    tooltip="Dodaj do ulubionych"
                    />
                <ActionButton
                    icon="📖"
                    onClick={() => onAddToWishlist(book)}
                    tooltip="Dodaj do listy życzeń"
                    />
                </div>
            )}
            {showRemove && (
                <button 
                    onClick={() => onRemove(book.id)}
                    style={{
                        width:"100%",
                        marginTop: "12px",
                        padding: "8px",
                        backgroundColor: "#FFB6C1",
                        border: "none",
                        borderRadius: "8px",
                        color: "#5A4A42",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontWeight: "500"
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#FF9AA2";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "#FFB6C1";
                    }}>
                        {removeLabel}
                    </button>
            )}
        </div>
    </div>
    )
} */

function ActionButton({icon, onClick, tooltip}){
    return(
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick()
            }}
            title={tooltip}
            style={{
                flex:1,
                padding: "8px",
                backgroundColor: "#D4C9BE",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                transition: "all 0.s ease"
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor= "#C4B9AE";
                e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor= "#D4C9BE";
                e.currentTarget.style.transform = "scale(1)";
            }}>
                {icon}
            </button>
    );
}

function EmptyState({icon, message, submessage}){
    return(
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
                {icon}
            </div>
            <h3 style={{
                fontSize: "24px",
                color: '#5A4A42',
                marginBottom: "10px"
            }}>
                {message}
            </h3>
            <p style={{
                fontSize: "16px",
                color: "#7A6A62"
            }}>
                {submessage}
            </p>
        </div>
    )
}
