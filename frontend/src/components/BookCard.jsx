import React, { useEffect, useState } from "react";

export default function BookCard({book, 
                                actionLabel = null, 
                                actionConfirmLabel = null, 
                                onAction = null, 
                                showRemove,
                                removeLabel, 
                                onRemove}){
    const [isHovered, setIsHovered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleAction = (e) =>{
      e.stopPropagation();
      if(!onAction) return;
      if (showConfirm) {
        onAction(book._id);
        setShowConfirm(false)
      }else{
        setShowConfirm(true);
        setTimeout(() => setShowConfirm(false), 3000);
      }
    };

    const handleRemove = (e) => {
        e.stopPropagation();

        if(!onRemove) return;
        if(showConfirm){
            onRemove(book._id);
            setShowConfirm(false);
        }else{
            setShowConfirm(true);
            setTimeout(() => setShowConfirm(false), 3000)
        }
    }

    const handleMouOut = (e) => {
        e.currentTarget.style.backgroundColor = actionConfirmLabel && showConfirm ? "#800F27" : "#BF092F";

        if(!showConfirm){
            e.currentTarget.style.backgroundColor = "#BF092F";
            e.currentTarget.style.color = "#D4C9BE";
        }
    }

    return(
        <div 
        onClick={() => window.location.href = `/book/${book._id}`}
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

                {showRemove ? (
                    <button
                        key={showConfirm}
                        onClick={handleRemove}
                        style={{
                            width: "100%",
                            padding: "10px",
                            backgroundColor: "#BF092F",
                            border: "none",
                            borderRadius: "8px",
                            color: showConfirm? "white" : "#D4C9BE",
                            fontSize: "16px",
                            fontWeight: "500",
                            cursor: "pointer",
                            marginTop: "auto"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = showConfirm ? "#ff5764" : "#FF9AA2"; 
                            e.currentTarget.style.color = "black" 
                        }}

                        onMouseOut={handleMouOut}
                        >
                   {showConfirm ? "Kliknij, by usunąć" : removeLabel}
                </button>
            

                    ): ( onAction && (
            <button 
                key = {showConfirm}
                onClick={handleAction}
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
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = showConfirm ? "#ff5764" : "#FF9AA2"; 
                    e.currentTarget.style.color = "black" 
                }}

                onMouseOut={handleMouOut}
                >
                    {showConfirm ? actionConfirmLabel : actionLabel}
                </button>
            )
        )}
                   
            </div>
    );
    }
