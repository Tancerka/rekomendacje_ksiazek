import React, {useState} from 'react';

const BookTile = ({
    book,
    onAddToFavorites,
    onAddToWishlist,
    onRemoveFromFavorites, 
    onRemoveFromWishlist,
    onClick,
    selected = false,
    isFavorite, 
    isWishlist,
    isAuthenticated
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return(
        <div 
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: selected 
                ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50&, #1e3c72 100%)'
                : isHovered
                ? 'linear-gradient(135deg, #0f2347 0%, #1a3d6b 50%, #0f2347 100%)'
                : 'linear-gradient(135deg, #0a1929 0%, #123458 50%, #0a1929 100%)',
                borderRadius: "16px",
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                transform: selected ? 'scale(1.02)' : isHovered ? 'scale(1.01)' : 'scale(1)',
                bosShadow: selected
                ? '0 8px 24px rgba(30, 60, 114, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                : isHovered
                ? '0 6px 20px rgba(18, 52, 88, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                : '0 4px 12px rgba(10, 25, 41, 0.2)',
                border: selected
                ? '2px solid rgba(255, 255, 255, 0.2)'
                : '2px solid rgba(255, 255, 255, 0.05)',
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                    transition: "left 0.5s ease",
                    left: isHovered ? "100%" : "-100%",
                    pointerEvents: "none"
                }}/>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr auto",
                    gap: "24px",
                    alignItems: "stretch",
                    position: "relative",
                    zIndex: 1,
                    minHeight: "200px"
                }}>

                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "100%"
                    }}>
                    <div style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "180px",
                        maxHeight: "240px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        transition: "transform 0.3s ease",
                        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                        flex: 1
                    }}>
                        {book.coverImage ? (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                                />
                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    background: "linear-gradient(135deg, #1a3d6b 0%, %0f2347 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "rgba(255, 255, 255, 0.3)",
                                    fontSize: "14px"
                                }}>
                                    Brak okładki
                                </div>
                        )}
                    </div>

                    {book.rating && (
                        <div style={{
                            background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 8px rgba(255, 215, 0, 0.3)",
                            border: "1px solid rgba(255, 237, 78, 0.5)",
                            minWidth: "80px",
                            justifyContent: "center"
                        }}>
                            <span style={{
                                fontSize: "18px",
                                color: "#8B4513",
                                fontWeight: "bold"
                            }}>
                                ⭐ 
                            </span>
                            <span style={{
                                fontSize: "17px",
                                fontWeight: "bold",
                                color: "#8B4513"
                            }}>
                                {book.rating}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    minWidth: 0,
                    color: "white",
                    justifyContent: "center",
                    paddingTop: "8px",
                    paddingBottom: "8px"
                }}>
                    <h3 style={{
                        fontSize: "20px",
                        fontWeight: "bold",
                        margin: 0,
                        color: "white",
                        lineHeight: "1.3",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical"
                    }}>
                        {book.title}
                    </h3>

                    <div style={{
                        fontSize: "15px",
                        color: "rgba(255, 255, 255, 0.85)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        <span style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            {book.authors.map(a => a.name || a).join(", ")}
                        </span>
                    </div>

                    {book.category && (
                        <div style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.75)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <span style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                            }}>
                                {book.category}
                            </span>
                        </div>
                    )}

                    {book.dominant_emotion && book.dominant_emotion.length > 0 && (
                        <div style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                            marginTop: "4px"
                        }}>
                            {book.dominant_emotion.map((emotion, idx) => (
                                <span 
                                    key={idx}
                                    style={{
                                        backgroundColor: "rgba(255, 182, 193, 0.2)",
                                        color: "#FFB6C1",
                                        padding: "4px 12px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        border: "1px solid rgba(255, 182, 193, 0.3)",
                                        backdropFilter: "blur(4px)"
                                    }}
                                    >
                                        {emotion}
                                    </span>
                            ))}
                        </div>
                    )}

                    {book.shortDescription && (
                        <p style={{
                            fontSize: "13px",
                            color: "rgba(255, 255, 255, 0.65)",
                            margin: "8px 0 0 0",
                            lineHeight: "1.5",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical"
                        }}>
                            {book.shortDescription}
                        </p>
                    )}
                </div>

                {isAuthenticated == true &&(
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    paddingLeft: "12px",
                    borderLeft: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                    <ActionButton
                        icon={ isFavorite ? "💔" : "🩷"}
                        label={isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                        onClick={(e) => {
                            e.stopPropagation();
                            isFavorite 
                            ? onRemoveFromFavorites(book._id)
                            : onAddToFavorites(book._id);
                        }}
/*                         disabled={isFavorite} */
                        color={isFavorite ? "#ff0000ff" : "#FF6B9D"}
                        />
                        <ActionButton
                            icon={ isWishlist ? "❌": "📖"}
                            label={isWishlist ? "Usuń z listy życzeń":"Dodaj do listy życzeń"}
                            onClick={(e)=> {
                                e.stopPropagation();
                                isWishlist
                                ? onRemoveFromWishlist(book._id)
                                : onAddToWishlist(book._id);
                            }}
/*                             disabled={isWishlist} */
                            color={isWishlist ? "#ff0000ff": "#4A90E2"}
                            />
                </div>
                        )}
            </div>
        </div>
    )
}

const ActionButton = ({ icon, label, onClick, color}) => {
    const [hover, setisHover] = useState(false);

    return(
        <button
            onClick={onClick}
            onMouseEnter={() => setisHover(true)}
            onMouseLeave={() => setisHover(false)}
            title={label}
            style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: `2px solid ${hover ? color : "rgba(255, 255, 255, 0.2)"}`,
                background: hover
                ? `linear-gradient(135deg, ${color}40 0%, ${color}20 100%)`
                : "rgba(255, 255, 255, 0.05)",
                cursor: "pointer",
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                transform: hover ? "scale(1.01) translateY(-1px)" : "scale(1)",
                boxShadow: hover 
                ? `0 4px 12px ${color}40`
                : "0 2px 6px rgba(0,0,0,0.2)",
                backdropFilter: "blur(4px)"
            }}>
                {icon}
            </button>
    )
}

export default BookTile;