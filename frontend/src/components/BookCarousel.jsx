import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard.jsx"

export default function BookCarousel({books}){

    const ref = useRef(null);
    const navigate = useNavigate();

    const scroll = (dir) => {
        ref.current.scrollBy({
            left: dir *320,
            behavior: "smooth"
        })
    }

    if(!books || books.length === 0 ) return null;

    console.debug(books);

    return(
        <div style={{position: "relative"}}>
                <Arrow 
                    side="left"
                    onClick={() => scroll(-1)} />
                <div 
                    ref={ref}
                    style={{
                        display: "flex",
                        gap: "20px",
                        overflowX: "auto",
                        scrollBehavior: "smooth",
                        padding: "10px 50px",
                        scrollbarWidth: "none"
                }}>
                    {books.map(book => (
                        <div
                            key={book._id}
                            onClick={() => navigate(`/book/${book._id}`)}
                            style={{
                                minWidth: "220px",
                                cursor: "pointer",
                            }}>
                            <BookCard book={book} />
                            <div style={{
                                fontSize: "24px",
                                color: "#123578",
                                textAlign: "center",
                                marginTop: "4px"
                            }}>
                                {book.emotion==="neutral" ? book.emotion="nieodkryte" : book.emotion}
                                </div>
                        </div>
                    ))}
                </div>
                <Arrow 
                    side="right"
                    onClick={() => scroll(1)} />
        </div>
    )
}

function Arrow({side = "left", onClick}){
    return(
        <button
            onClick={onClick}
            style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                [side]: "10px",
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                border: "none",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                cursor: "pointer",
                zIndex: 10,
                fontSize: "22px",
                fontWeight: "bold",
                color: "#123578",
                transition: "transform 0.2s, background-color: 0.2s"
            }}
            onMouseEnter = {(e) => {
                e.currentTarget.style.transform = "translateY(-50%) scale(1.02)";
            }}
            onMouseLeave = {(e) => {
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}>
                {side === "left" ? "<" : ">"}
            </button>
    )
}