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
/*             const recRes = await fetch("/auth/recommendations", {credentials: "include"})
            const recData = await recRes.json();
            setRecommendations(recData.recommendations || []); */

            const favRes = await fetch("/auth/favorites", {credentials: "include"})
            const favData = await favRes.json();
            setFavorites(favData.favorites || []);

            const wishRes = await fetch("/auth/wishlist", {credentials: "include"})
            const wishData = await wishRes.json();
            setWishlist(wishData.wishlist || []);

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
        { id: "edit", label: "Edycja profilu"},
        { id: "password", label: "Zmień hasło"}
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

    const toggleElements = () => {
        
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
                    label="Średnia ocen ulubionych książek"
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
                            {(tab.id === "edit" || tab.id==="password" ? tab.label : `${tab.label} (${tab.count})`)}
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
                    {activeTab === "password" && (
                        <div style= {{
                            maxWidth: "500px",
                            margin: "0 auto"
                        }}>

                            <h3 style={{
                                color: "#123578",
                                fontWeight: "600"
                            }}>
                                Edytuj hasło
                            </h3>
                            <label 
                                id="label-oldPasswd"
                                style={{
                                    color: "#7A6A62"
                                }}>
                                Stare hasło
                            </label>
                            <input 
                                id="input-oldPasswd"
                                type="oldPassword"
                                value={profile.oldPassword}
/*                                 onChange={(e) => setProfile({...profile, email: e.target.value})} */
                                style={inputStyle}
                                />     
                            <label 
                                id="label-newPasswd"
                                style={{
                                    color: "#7A6A62"
                                }}>
                                Nowe hasło
                            </label>
                            <input 
                                id="input-newPasswd"
                                type="newPassword"
                                value={profile.newPassword}
/*                                 onChange={(e) => setProfile({...profile, email: e.target.value})} */
                                style={inputStyle}
                                />
                            <label 
                                id="label-repeatPasswd"
                                style={{
                                    color: "#7A6A62"
                                }}>
                                Powtórz nowe hasło
                            </label>
                            <input 
                                id="input-repeatPasswd"
                                type="repeatNewPassword"
                                value={profile.repeatNewPassword}
/*                                 onChange={(e) => setProfile({...profile, email: e.target.value})} */
                                style={inputStyle}
                                />
                                    <button 
                                        id="toggle-passwd"
                                        style={BtnStyle}
                                        onClick={toggleElements}>
                                            Zmień hasło
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
